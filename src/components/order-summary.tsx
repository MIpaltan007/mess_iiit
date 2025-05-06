'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CreditCard, CheckCircle } from 'lucide-react'; // Example icons
import { processPayment, type PaymentInfo, type PaymentResult } from '@/services/payment';
import { sendNotification, type Notification, type NotificationResult } from '@/services/notification';
import Link from 'next/link';


interface MealPlan {
  id: string;
  name: string;
  mealsPerWeek: number;
  pricePerWeek: number;
  description: string;
}

// This should ideally be shared or fetched, duplicating for now.
const availablePlans: MealPlan[] = [
  { id: 'plan1', name: 'Basic Bites', mealsPerWeek: 5, pricePerWeek: 35.00, description: '5 meals of your choice per week.' },
  { id: 'plan2', name: 'Daily Delights', mealsPerWeek: 10, pricePerWeek: 65.00, description: '10 meals, perfect for regular diners.' },
  { id: 'plan3', name: 'Full Feast', mealsPerWeek: 15, pricePerWeek: 90.00, description: '15 meals, covering most of your weekly needs.' },
];

const LOCAL_STORAGE_KEY = 'selectedMealPlan';

export const OrderSummary: FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const updateSummary = () => {
    const storedPlanId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedPlanId) {
      const plan = availablePlans.find(p => p.id === storedPlanId);
      setSelectedPlan(plan || null);
    } else {
      setSelectedPlan(null);
    }
  };

  useEffect(() => {
    updateSummary(); // Initial load

    // Listen for custom event from MealPlanSelection
    window.addEventListener('mealPlanChanged', updateSummary);
    return () => {
      window.removeEventListener('mealPlanChanged', updateSummary);
    };
  }, []);

  const handleProceedToPayment = async () => {
    if (!selectedPlan) {
      toast({
        title: 'Error',
        description: 'No meal plan selected to proceed with payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate user being logged in
    const MOCK_USER_EMAIL = "student@example.com"; 
    const MOCK_USER_ID = "user123";

    try {
      const paymentInfo: PaymentInfo = {
        amount: selectedPlan.pricePerWeek,
        currency: 'USD',
      };
      const paymentResult: PaymentResult = await processPayment(paymentInfo);

      if (paymentResult.success) {
        toast({
          title: 'Payment Successful!',
          description: `Transaction ID: ${paymentResult.transactionId}. Your coupons are now active.`,
          action: <CheckCircle className="text-green-500" />,
        });

        // Send notification
        const notification: Notification = {
          recipient: MOCK_USER_EMAIL, // Replace with actual user email
          subject: 'Meal Plan Purchased Successfully',
          body: `Dear Student, your purchase of the ${selectedPlan.name} for $${selectedPlan.pricePerWeek.toFixed(2)} was successful. Your coupons are ready to use!`,
        };
        const notificationResult: NotificationResult = await sendNotification(notification);
        if (!notificationResult.success) {
          console.warn("Failed to send purchase notification:", notificationResult.message);
        }

        // Here, you might want to update user's account in a real backend
        // For example, store purchased coupons associated with the user ID.
        console.log(`User ${MOCK_USER_ID} purchased ${selectedPlan.name}. Coupons: ${selectedPlan.mealsPerWeek}`);


        // Clear selection from local storage after successful payment
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setSelectedPlan(null); // Update UI

      } else {
        toast({
          title: 'Payment Failed',
          description: paymentResult.message || 'Please try again or contact support.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred during payment. Please try again.',
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
          Order Summary
        </CardTitle>
        <CardDescription>Review your selected meal plan before proceeding.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedPlan ? (
          <>
            <div>
              <h4 className="font-medium">{selectedPlan.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedPlan.mealsPerWeek} meals per week
              </p>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total Cost:</span>
              <span>${selectedPlan.pricePerWeek.toFixed(2)}</span>
            </div>
            <Button 
              onClick={handleProceedToPayment} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              By clicking "Proceed to Payment", you agree to our terms and conditions.
            </p>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <p>Please select a meal plan to see your order summary.</p>
            <p className="text-xs mt-1">You might need to <Link href="/auth/login" className="underline text-primary">log in</Link> to purchase.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
