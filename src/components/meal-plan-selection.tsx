'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // Using ShadCN toast
import { CheckCircle, Salad } from 'lucide-react'; // Example icons

interface MealPlan {
  id: string;
  name: string;
  mealsPerWeek: number;
  pricePerWeek: number;
  description: string;
}

const availablePlans: MealPlan[] = [
  { id: 'plan1', name: 'Basic Bites', mealsPerWeek: 5, pricePerWeek: 35.00, description: '5 meals of your choice per week.' },
  { id: 'plan2', name: 'Daily Delights', mealsPerWeek: 10, pricePerWeek: 65.00, description: '10 meals, perfect for regular diners.' },
  { id: 'plan3', name: 'Full Feast', mealsPerWeek: 15, pricePerWeek: 90.00, description: '15 meals, covering most of your weekly needs.' },
];

const LOCAL_STORAGE_KEY = 'selectedMealPlan';

export const MealPlanSelection: FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const storedPlanId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedPlanId) {
      setSelectedPlanId(storedPlanId);
    }
  }, []);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleConfirmSelection = () => {
    if (selectedPlanId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, selectedPlanId);
      const plan = availablePlans.find(p => p.id === selectedPlanId);
      toast({
        title: 'Plan Selected!',
        description: `You've selected the ${plan?.name || 'plan'}.`,
        action: <CheckCircle className="text-green-500" />,
      });
      // Trigger update in OrderSummary (e.g., via a shared state or event)
      // For now, OrderSummary will also read from localStorage
      window.dispatchEvent(new Event('mealPlanChanged'));

    } else {
      toast({
        title: 'No Plan Selected',
        description: 'Please choose a meal plan first.',
        variant: 'destructive',
      });
    }
  };

  const selectedPlanDetails = availablePlans.find(p => p.id === selectedPlanId);

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <Salad className="h-6 w-6" />
          Select Your Meal Plan
        </CardTitle>
        <CardDescription>Choose a plan that best suits your needs for the week.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select onValueChange={handlePlanSelect} value={selectedPlanId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a meal plan" />
          </SelectTrigger>
          <SelectContent>
            {availablePlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} ({plan.mealsPerWeek} meals/week) - ${plan.pricePerWeek.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPlanDetails && (
          <div className="p-4 border rounded-md bg-secondary/50">
            <h4 className="font-semibold">{selectedPlanDetails.name}</h4>
            <p className="text-sm text-muted-foreground">{selectedPlanDetails.description}</p>
            <p className="text-sm font-medium">Meals: {selectedPlanDetails.mealsPerWeek} per week</p>
            <p className="text-sm font-medium">Price: ${selectedPlanDetails.pricePerWeek.toFixed(2)} per week</p>
          </div>
        )}

        <Button 
          onClick={handleConfirmSelection} 
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          disabled={!selectedPlanId}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Confirm Selection
        </Button>
      </CardContent>
    </Card>
  );
};
