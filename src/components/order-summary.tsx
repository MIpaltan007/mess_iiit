
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CreditCard, CheckCircle, Trash2, ExternalLink } from 'lucide-react';
import { processPayment, type PaymentInfo, type PaymentResult } from '@/services/payment';
import { sendNotification, type Notification as NotificationType } from '@/services/notification';
import { saveOrder, type OrderData } from '@/services/orderService';
import { createCouponForOrder } from '@/services/couponService'; // Import createCouponForOrder
import Link from 'next/link';
import type { MenuItem } from './menu-display';

interface OrderSummaryProps {
  selectedMeals: MenuItem[];
  currentUserEmail: string | null;
  currentUserDisplayName: string | null;
  currentUserUid: string | null; // Added currentUserUid
  onPaymentSuccess: () => void; // Callback to clear selections in parent
}

export const OrderSummary: FC<OrderSummaryProps> = ({ selectedMeals, currentUserEmail, currentUserDisplayName, currentUserUid, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const totalCost = useMemo(() => {
    return selectedMeals.reduce((sum, meal) => sum + meal.price, 0);
  }, [selectedMeals]);

  const orderDetailsLink = useMemo(() => {
    if (orderId && typeof window !== 'undefined') {
      return `${window.location.origin}/order-details/${orderId}`;
    }
    return null;
  }, [orderId]);

  useEffect(() => {
    if (selectedMeals.length === 0 && !isLoading && !orderDetailsLink) { // Only clear orderId if not loading and link not already generated
      setOrderId(null);
    }
  }, [selectedMeals, isLoading, orderDetailsLink]);


  const handleProceedToPayment = async () => {
    if (selectedMeals.length === 0) {
      toast({
        title: 'No Meals Selected',
        description: 'Please select some meals before proceeding to payment.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUserEmail || !currentUserUid) { // Also check for currentUserUid
        toast({
            title: 'Not Logged In',
            description: 'Please log in to proceed with your order.',
            variant: 'destructive',
            action: <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>
        });
        return;
    }

    setIsLoading(true);
    
    try {
      const paymentInfo: PaymentInfo = {
        amount: totalCost,
        currency: 'INR',
      };
      const paymentResult: PaymentResult = await processPayment(paymentInfo);

      if (paymentResult.success) {
        const orderDataForDb: Omit<OrderData, 'id' | 'createdAt'> = {
          userEmail: currentUserEmail,
          userName: currentUserDisplayName || undefined,
          selectedMeals: selectedMeals,
          totalCost: totalCost,
        };
        const newOrderId = await saveOrder(orderDataForDb);
        setOrderId(newOrderId); 
        
        // Create a coupon for this order
        try {
          await createCouponForOrder(newOrderId, currentUserUid);
          toast({
            title: 'Payment Successful & Order Link Generated!',
            description: `Order link for ${newOrderId} is ready. A new coupon has been created. Transaction ID: ${paymentResult.transactionId}.`,
            action: <CheckCircle className="text-green-500" />,
          });
        } catch (couponError) {
          console.error("Failed to create coupon for order:", newOrderId, couponError);
          toast({ // Inform user about order success, but coupon creation issue
            title: 'Payment Successful & Order Link Generated!',
            description: `Order link for ${newOrderId} is ready. Transaction ID: ${paymentResult.transactionId}. (Note: Coupon creation failed, please contact support if needed)`,
            variant: "default", // Keep it default as order was successful
            duration: 7000,
            action: <CheckCircle className="text-green-500" />,
          });
        }
        
        const mealNames = selectedMeals.map(m => m.name).join(', ');
        const notification: NotificationType = {
          recipient: currentUserEmail,
          subject: 'Meal Order Confirmed & Details Link Generated',
          body: `Dear ${currentUserDisplayName || 'Customer'}, your order for ${mealNames} (Total: ₹${totalCost.toFixed(2)}) was successful. Use the link provided to view your order details. Order ID: ${newOrderId}.`,
        };
        await sendNotification(notification);
        
        onPaymentSuccess(); 

      } else {
        toast({
          title: 'Payment Failed',
          description: paymentResult.message || 'Please try again or contact support.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Payment or Order processing error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Your Order
        </CardTitle>
        <CardDescription>Review your selected meals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderDetailsLink ? ( 
          <div className="text-center space-y-3 p-4 border border-green-500 rounded-md bg-green-50">
            <h3 className="text-lg font-semibold text-green-700">Order Confirmed!</h3>
            <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
            
            <p className="text-sm text-foreground">Access your order details using the link below:</p>
            <a 
              href={orderDetailsLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-1.5 text-primary underline font-medium hover:text-primary/80 break-all"
            >
              <ExternalLink className="h-4 w-4"/> View Order Details: {orderId}
            </a>

            <Button onClick={() => { setOrderId(null); }} variant="outline" size="sm" className="mt-4">
              Place New Order
            </Button>
          </div>
        ) : selectedMeals.length > 0 ? (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {selectedMeals.map(meal => (
              <li key={meal.id} className="flex justify-between items-center text-sm border-b pb-1">
                <span>{meal.name} ({meal.mealType})</span>
                <span className="font-medium">₹{meal.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <p>Your cart is empty.</p>
            <p className="text-xs mt-1">Select meals from the menu to add them here.</p>
          </div>
        )}
      </CardContent>
      
      {!orderDetailsLink && selectedMeals.length > 0 && ( 
        <CardFooter className="flex flex-col gap-4 pt-4 border-t">
            <div className="w-full flex justify-between items-center font-semibold text-lg">
              <span>Total Cost:</span>
              <span>₹{totalCost.toFixed(2)}</span>
            </div>
            <Button 
              onClick={handleProceedToPayment} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || selectedMeals.length === 0}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {isLoading ? 'Processing...' : `Pay ₹${totalCost.toFixed(2)} & Get Details Link`}
            </Button>
             <Button 
              onClick={() => {
                onPaymentSuccess(); 
                setOrderId(null);   
              }}
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear Selections
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              By clicking "Pay", you agree to our terms and conditions.
            </p>
        </CardFooter>
      )}

       {!currentUserEmail && !orderDetailsLink && selectedMeals.length > 0 && (
         <CardFooter className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground w-full">
                Please <Link href="/auth/login" className="underline text-primary font-medium">log in</Link> to complete your purchase.
            </p>
         </CardFooter>
        )}
    </Card>
  );
};

