
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CreditCard, CheckCircle, Trash2, QrCode, ExternalLink } from 'lucide-react';
import { processPayment, type PaymentInfo, type PaymentResult } from '@/services/payment';
import { sendNotification, type Notification as NotificationType } from '@/services/notification';
import { saveOrder, type OrderData } from '@/services/orderService';
import Link from 'next/link';
import type { MenuItem } from './menu-display';
import Image from 'next/image';

interface OrderSummaryProps {
  selectedMeals: MenuItem[];
  currentUserEmail: string | null;
  onPaymentSuccess: () => void; // Callback to clear selections in parent
}

export const OrderSummary: FC<OrderSummaryProps> = ({ selectedMeals, currentUserEmail, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false); // State to track image loading errors
  const { toast } = useToast();

  const totalCost = useMemo(() => {
    return selectedMeals.reduce((sum, meal) => sum + meal.price, 0);
  }, [selectedMeals]);

  useEffect(() => {
    // Reset QR code and image error if selected meals change or user logs out
    if (selectedMeals.length === 0 || !currentUserEmail) {
      setQrCodeUrl(null);
      setOrderId(null);
      setImageError(false);
    }
  }, [selectedMeals, currentUserEmail]);

  // Reset image error when a new QR code URL is generated
  useEffect(() => {
    setImageError(false);
  }, [qrCodeUrl]);

  const handleProceedToPayment = async () => {
    if (selectedMeals.length === 0) {
      toast({
        title: 'No Meals Selected',
        description: 'Please select some meals before proceeding to payment.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUserEmail) {
        toast({
            title: 'Not Logged In',
            description: 'Please log in to proceed with your order.',
            variant: 'destructive',
            action: <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>
        });
        return;
    }

    setIsLoading(true);
    setQrCodeUrl(null);
    setOrderId(null);
    setImageError(false);
    
    try {
      const paymentInfo: PaymentInfo = {
        amount: totalCost,
        currency: 'INR',
      };
      const paymentResult: PaymentResult = await processPayment(paymentInfo);

      if (paymentResult.success) {
        const orderDataForDb: Omit<OrderData, 'id' | 'createdAt'> = {
          userEmail: currentUserEmail,
          selectedMeals: selectedMeals,
          totalCost: totalCost,
        };
        const newOrderId = await saveOrder(orderDataForDb);
        setOrderId(newOrderId);

        const orderDetailsPath = `/order-details/${newOrderId}`;
        const absoluteOrderDetailsURL = `${window.location.origin}${orderDetailsPath}`;

        const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(absoluteOrderDetailsURL)}&size=250x250&format=png`;
        setQrCodeUrl(generatedQrUrl);
        
        toast({
          title: 'Payment Successful & Order Placed!',
          description: `Your QR code for order ${newOrderId} is generated below. Transaction ID: ${paymentResult.transactionId}.`,
          action: <CheckCircle className="text-green-500" />,
        });

        const mealNames = selectedMeals.map(m => m.name).join(', ');
        const notification: NotificationType = {
          recipient: currentUserEmail,
          subject: 'Meal Order Confirmed & QR Code Generated',
          body: `Dear Customer, your order for ${mealNames} (Total: ₹${totalCost.toFixed(2)}) was successful. Scan your QR code at the mess. Order ID: ${newOrderId}.`,
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
        {qrCodeUrl && orderId ? (
          <div className="text-center space-y-3 p-4 border border-green-500 rounded-md bg-green-50">
            <h3 className="text-lg font-semibold text-green-700">Order Confirmed!</h3>
            <p className="text-sm text-muted-foreground">Scan this QR code at the mess for Order ID: {orderId}.</p>
            <div className="flex justify-center">
              {!imageError ? (
                <Image 
                  data-ai-hint="qr code"
                  src={qrCodeUrl} 
                  alt={`QR Code for order ${orderId}`} 
                  width={200} 
                  height={200} 
                  className="rounded-md shadow-md"
                  onError={() => {
                    console.error("Failed to load QR code image from:", qrCodeUrl);
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="p-4 border border-destructive rounded-md bg-red-50 text-destructive text-sm">
                  <p>Could not load QR code image.</p>
                  <p className="mt-1">
                    Try accessing it directly: 
                    <a 
                      href={qrCodeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline ml-1 font-medium hover:text-destructive/80 flex items-center justify-center"
                    >
                      Open QR Link <ExternalLink className="h-4 w-4 ml-1"/>
                    </a>
                  </p>
                </div>
              )}
            </div>
             <Button onClick={() => { setQrCodeUrl(null); setOrderId(null); setImageError(false); }} variant="outline" size="sm" className="mt-2">
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
      
      {!qrCodeUrl && selectedMeals.length > 0 && (
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
              {isLoading ? 'Processing...' : `Pay ₹${totalCost.toFixed(2)} & Get QR`}
            </Button>
             <Button 
              onClick={() => {
                onPaymentSuccess(); 
                setQrCodeUrl(null); 
                setOrderId(null);
                setImageError(false);
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

       {!currentUserEmail && !qrCodeUrl && selectedMeals.length > 0 && (
         <CardFooter className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground w-full">
                Please <Link href="/auth/login" className="underline text-primary font-medium">log in</Link> to complete your purchase.
            </p>
         </CardFooter>
        )}
    </Card>
  );
};

