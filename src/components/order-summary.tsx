
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CreditCard, CheckCircle, Trash2, ExternalLink, Info } from 'lucide-react';
import { processPayment, type PaymentInfo, type PaymentResult } from '@/services/payment';
import { sendNotification, type Notification as NotificationType } from '@/services/notification';
import { saveOrder, type OrderData } from '@/services/orderService';
import { createCouponForOrder } from '@/services/couponService';
import Link from 'next/link';
import type { MenuItem } from './menu-display';
import type { UserProfile } from '@/services/userService'; // Import UserProfile
import { saveUserProfile } from '@/services/userService'; // Import saveUserProfile

interface OrderSummaryProps {
  selectedMeals: MenuItem[];
  currentUserEmail: string | null;
  currentUserDisplayName: string | null;
  currentUserUid: string | null;
  currentUserProfile: UserProfile | null; // Added currentUserProfile
  onPaymentSuccess: () => void;
}

export const OrderSummary: FC<OrderSummaryProps> = ({
  selectedMeals,
  currentUserEmail,
  currentUserDisplayName,
  currentUserUid,
  currentUserProfile,
  onPaymentSuccess,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null); // For newly created order
  const { toast } = useToast();

  const [isStudentRestricted, setIsStudentRestricted] = useState(false);
  const [studentNextPurchaseDate, setStudentNextPurchaseDate] = useState<string | null>(null);
  const [studentExistingOrderLink, setStudentExistingOrderLink] = useState<string | null>(null);

  const orderDetailsLink = useMemo(() => {
    if (orderId && typeof window !== 'undefined') { // Link for NEWLY created order
      return `${window.location.origin}/order-details/${orderId}`;
    }
    return null;
  }, [orderId]);

  // Effect to check student restriction status
  useEffect(() => {
    if (currentUserProfile?.role === 'Student' && currentUserProfile.lastPurchaseAt && currentUserProfile.lastOrderId) {
      const lastPurchaseDate = new Date(currentUserProfile.lastPurchaseAt);
      const sevenDaysAfterPurchase = new Date(lastPurchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now < sevenDaysAfterPurchase) {
        setIsStudentRestricted(true);
        setStudentNextPurchaseDate(sevenDaysAfterPurchase.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }));
        if (typeof window !== 'undefined') {
          setStudentExistingOrderLink(`${window.location.origin}/order-details/${currentUserProfile.lastOrderId}`);
        }
        setOrderId(null); // Clear any new order link state if student is restricted
      } else {
        setIsStudentRestricted(false);
        setStudentNextPurchaseDate(null);
        setStudentExistingOrderLink(null);
      }
    } else {
      setIsStudentRestricted(false);
      setStudentNextPurchaseDate(null);
      setStudentExistingOrderLink(null);
    }
  }, [currentUserProfile]);

  // Effect to clear new orderId if selections are empty AND student is not restricted
   useEffect(() => {
    if (selectedMeals.length === 0 && !isLoading && !orderDetailsLink && !isStudentRestricted) {
      setOrderId(null);
    }
  }, [selectedMeals, isLoading, orderDetailsLink, isStudentRestricted]);


  const totalCost = useMemo(() => {
    return selectedMeals.reduce((sum, meal) => sum + meal.price, 0);
  }, [selectedMeals]);


  const handleProceedToPayment = async () => {
    if (selectedMeals.length === 0) {
      toast({
        title: 'No Meals Selected',
        description: 'Please select some meals before proceeding to payment.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUserEmail || !currentUserUid) {
        toast({
            title: 'Not Logged In',
            description: 'Please log in to proceed with your order.',
            variant: 'destructive',
            action: <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>
        });
        return;
    }

    // Student restriction check before payment attempt
    if (currentUserProfile?.role === 'Student') {
        if (currentUserProfile.lastPurchaseAt) {
            const lastPurchaseDate = new Date(currentUserProfile.lastPurchaseAt);
            const sevenDaysAfterPurchase = new Date(lastPurchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            const now = new Date();
            if (now < sevenDaysAfterPurchase) {
                toast({
                    title: "Purchase Limit Reached",
                    description: `Students can purchase meals once a week. Your next purchase is available after ${sevenDaysAfterPurchase.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}.`,
                    variant: "destructive",
                    duration: 7000,
                });
                return; 
            }
        }
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
          userId: currentUserUid, // Ensure userId is included
          userEmail: currentUserEmail,
          userName: currentUserDisplayName || undefined,
          selectedMeals: selectedMeals,
          totalCost: totalCost,
        };
        const newOrderId = await saveOrder(orderDataForDb);
        setOrderId(newOrderId); 
        
        try {
          await createCouponForOrder(newOrderId, currentUserUid);
        } catch (couponError) {
          console.error("Failed to create coupon for order:", newOrderId, couponError);
        }
        
        // Update student's last purchase info
        if (currentUserProfile?.role === 'Student') {
            const updatedProfileData: UserProfile = {
                ...currentUserProfile, 
                uid: currentUserUid,    
                email: currentUserEmail, 
                fullName: currentUserDisplayName || currentUserProfile.fullName || '', 
                lastPurchaseAt: new Date().toISOString(),
                lastOrderId: newOrderId,
            };
            try {
                await saveUserProfile(updatedProfileData);
            } catch (profileError) {
                console.error("Failed to update student's last purchase time:", profileError);
                toast({ title: "Order Placed", description: `Order ${newOrderId} successful, but failed to update your purchase record. Please contact support if issues persist.`, variant: "default", duration: 10000 });
            }
        }

        toast({
            title: 'Payment Successful & Order Link Generated!',
            description: `Order link for ${newOrderId} is ready. Transaction ID: ${paymentResult.transactionId}. A new coupon has been created.`,
            action: <CheckCircle className="text-green-500" />,
        });
        
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

  const handleClearAndReset = () => {
    onPaymentSuccess(); // Clears selected meals in parent
    setOrderId(null); // Clears the new order link
  };


  if (isStudentRestricted && studentExistingOrderLink) {
    return (
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
            <Info className="h-6 w-6" />
            Weekly Meal Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
            <p className="text-foreground font-medium">You have an active meal order for this week.</p>
            <a 
              href={studentExistingOrderLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-1.5 text-primary underline font-medium hover:text-primary/80 break-all"
            >
              <ExternalLink className="h-4 w-4"/> View Your Current Order
            </a>
            {studentNextPurchaseDate && (
                 <p className="text-sm text-muted-foreground">
                    You can purchase new meals after {studentNextPurchaseDate}.
                </p>
            )}
        </CardContent>
      </Card>
    );
  }


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
              onClick={handleClearAndReset}
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

       {!currentUserEmail && !orderDetailsLink && !isStudentRestricted && selectedMeals.length > 0 && (
         <CardFooter className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground w-full">
                Please <Link href="/auth/login" className="underline text-primary font-medium">log in</Link> to complete your purchase.
            </p>
         </CardFooter>
        )}
    </Card>
  );
};

