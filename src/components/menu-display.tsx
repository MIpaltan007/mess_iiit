
'use client';

import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Carrot, Leaf, Fish, WheatOff } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { UserProfile, UserRole } from '@/services/userService'; // Import UserProfile and UserRole

export interface MenuItem {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  description: string;
  dietaryTags: DietaryTag[];
  calories: number;
  price: number; // Price will now be dynamically set based on role
}

type DietaryTag = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Non-Veg';

const getPrice = (mealType: 'Breakfast' | 'Lunch' | 'Dinner', role: UserRole | null | undefined): number => {
  if (role === 'Staff') {
    switch (mealType) {
      case 'Breakfast': return 20;
      case 'Lunch': return 35;
      case 'Dinner': return 30;
      default: return 0;
    }
  }
  // Default prices for Student, Admin, or if role is unknown
  switch (mealType) {
    case 'Breakfast': return 25;
    case 'Lunch': return 45;
    case 'Dinner': return 40;
    default: return 0;
  }
};

// Base menu data without prices
const initialMenuDataTemplate: Omit<MenuItem, 'price'>[] = [
  { id: '1', day: 'Monday', mealType: 'Breakfast', name: 'Scrambled Eggs & Toast', description: 'Classic scrambled eggs with whole wheat toast.', dietaryTags: ['Non-Veg'], calories: 350 },
  { id: '2', day: 'Monday', mealType: 'Lunch', name: 'Chicken Salad Sandwich', description: 'Grilled chicken salad on multigrain bread.', dietaryTags: ['Non-Veg'], calories: 550 },
  { id: '3', day: 'Monday', mealType: 'Dinner', name: 'Lentil Soup', description: 'Hearty lentil soup with vegetables.', dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free'], calories: 400 },
  { id: '4', day: 'Tuesday', mealType: 'Breakfast', name: 'Oatmeal with Berries', description: 'Warm oatmeal topped with mixed berries and nuts.', dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free'], calories: 300 },
  { id: '5', day: 'Tuesday', mealType: 'Lunch', name: 'Quinoa Salad', description: 'Refreshing quinoa salad with cucumber, tomatoes, and feta.', dietaryTags: ['Vegetarian', 'Gluten-Free'], calories: 450 },
  { id: '6', day: 'Tuesday', mealType: 'Dinner', name: 'Grilled Salmon', description: 'Salmon fillet grilled to perfection with roasted asparagus.', dietaryTags: ['Non-Veg', 'Gluten-Free'], calories: 600 },
  { id: '7', day: 'Wednesday', mealType: 'Breakfast', name: 'Pancakes', description: 'Fluffy pancakes with maple syrup.', dietaryTags: ['Vegetarian'], calories: 450 },
  { id: '8', day: 'Wednesday', mealType: 'Lunch', name: 'Vegetable Stir-fry', description: 'Mixed vegetables stir-fried with tofu and soy sauce.', dietaryTags: ['Vegan', 'Vegetarian'], calories: 500 },
  { id: '9', day: 'Wednesday', mealType: 'Dinner', name: 'Spaghetti Bolognese', description: 'Classic spaghetti with a rich meat sauce.', dietaryTags: ['Non-Veg'], calories: 650 },
  { id: '10', day: 'Thursday', mealType: 'Breakfast', name: 'Yogurt Parfait', description: 'Greek yogurt with granola and fresh fruits.', dietaryTags: ['Vegetarian'], calories: 320 },
  { id: '11', day: 'Thursday', mealType: 'Lunch', name: 'Turkey Club Sandwich', description: 'Triple-decker sandwich with turkey, bacon, lettuce, and tomato.', dietaryTags: ['Non-Veg'], calories: 600 },
  { id: '12', day: 'Thursday', mealType: 'Dinner', name: 'Beef Tacos', description: 'Seasoned ground beef in crispy taco shells with toppings.', dietaryTags: ['Non-Veg'], calories: 550 },
  { id: '13', day: 'Friday', mealType: 'Breakfast', name: 'Smoothie Bowl', description: 'Blended açai with banana, berries, and coconut flakes.', dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free'], calories: 380 },
  { id: '14', day: 'Friday', mealType: 'Lunch', name: 'Fish and Chips', description: 'Battered cod fillets with a side of crispy fries.', dietaryTags: ['Non-Veg'], calories: 700 },
  { id: '15', day: 'Friday', mealType: 'Dinner', name: 'Margherita Pizza', description: 'Classic pizza with tomatoes, mozzarella, and basil.', dietaryTags: ['Vegetarian'], calories: 620 },
  { id: '16', day: 'Saturday', mealType: 'Breakfast', name: 'Waffles with Syrup', description: 'Crispy Belgian waffles served with butter and maple syrup.', dietaryTags: ['Vegetarian'], calories: 480 },
  { id: '17', day: 'Saturday', mealType: 'Lunch', name: 'BBQ Pulled Pork Sandwich', description: 'Slow-cooked pulled pork in BBQ sauce on a brioche bun.', dietaryTags: ['Non-Veg'], calories: 650 },
  { id: '18', day: 'Saturday', mealType: 'Dinner', name: 'Chicken Alfredo', description: 'Creamy Alfredo pasta with grilled chicken breast.', dietaryTags: ['Non-Veg'], calories: 720 },
  { id: '19', day: 'Sunday', mealType: 'Breakfast', name: 'French Toast', description: 'Thick-cut bread dipped in egg batter, served with berries.', dietaryTags: ['Vegetarian'], calories: 420 },
  { id: '20', day: 'Sunday', mealType: 'Lunch', name: 'Roast Chicken with Vegetables', description: 'Herb-roasted chicken with seasonal vegetables.', dietaryTags: ['Non-Veg', 'Gluten-Free'], calories: 600 },
  { id: '21', day: 'Sunday', mealType: 'Dinner', name: 'Shepherd\'s Pie', description: 'Ground lamb and vegetables topped with mashed potatoes.', dietaryTags: ['Non-Veg'], calories: 680 },
];

const dietaryTagIcons: Record<DietaryTag, React.ReactElement> = {
  'Vegetarian': <Leaf className="h-4 w-4 text-green-500" />,
  'Vegan': <Carrot className="h-4 w-4 text-orange-500" />,
  'Gluten-Free': <WheatOff className="h-4 w-4 text-yellow-500" />,
  'Non-Veg': <Fish className="h-4 w-4 text-blue-500" />,
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface MenuDisplayProps {
  currentUser: FirebaseUser | null;
  currentUserProfile: UserProfile | null; // Added to get role
  onMealSelect: (meal: MenuItem, isSelected: boolean) => void;
  selectedMeals: MenuItem[];
}

export const MenuDisplay: FC<MenuDisplayProps> = ({ currentUser, currentUserProfile, onMealSelect, selectedMeals }) => {
  const [filter, setFilter] = useState<DietaryTag | 'All'>('All');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const { toast } = useToast();

  const menuDataWithDynamicPrices = useMemo(() => {
    const role = currentUserProfile?.role || null; // Default to student prices if no role
    return initialMenuDataTemplate.map(item => ({
      ...item,
      price: getPrice(item.mealType, role),
    }));
  }, [currentUserProfile]);


  const filteredMenu = useMemo(() => {
    return menuDataWithDynamicPrices
      .filter(item => item.day === selectedDay)
      .filter(item => filter === 'All' || item.dietaryTags.includes(filter));
  }, [menuDataWithDynamicPrices, filter, selectedDay]);

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as DietaryTag | 'All');
  };

  const handleMealCheckboxChange = (item: MenuItem, checked: boolean) => {
    if (!currentUser && checked) {
      toast({
        title: 'Login Required',
        description: 'Please log in or register to select meals.',
        variant: 'destructive',
        action: <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>,
      });
      return; 
    }
    onMealSelect(item, checked);
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Weekly Menu</CardTitle>
        <CardDescription>Explore our delicious and healthy meal options for the week. Select individual meals. Prices may vary based on your role.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 flex-wrap">
            {daysOfWeek.map(day => (
              <Button
                key={day}
                variant={selectedDay === day ? 'default' : 'outline'}
                onClick={() => handleDayChange(day)}
                className="capitalize"
              >
                {day}
              </Button>
            ))}
          </div>
          <Select onValueChange={handleFilterChange} defaultValue="All">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by diet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Diets</SelectItem>
              <SelectItem value="Vegetarian">Vegetarian</SelectItem>
              <SelectItem value="Vegan">Vegan</SelectItem>
              <SelectItem value="Gluten-Free">Gluten-Free</SelectItem>
              <SelectItem value="Non-Veg">Non-Veg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredMenu.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Dietary Info</TableHead>
                <TableHead className="text-right">Calories</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Select</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMenu.map((item) => {
                const isSelected = selectedMeals.some(m => m.id === item.id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.mealType}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.dietaryTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1 capitalize">
                            {dietaryTagIcons[tag]}
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.calories} kcal</TableCell>
                    <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        id={`select-meal-${item.id}`}
                        checked={isSelected}
                        onCheckedChange={(checkedState) => handleMealCheckboxChange(item, !!checkedState)}
                        aria-label={`Select ${item.name}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-4">No meals match your current filter for {selectedDay}.</p>
        )}
      </CardContent>
    </Card>
  );
};
