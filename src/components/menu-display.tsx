
'use client';

import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Carrot, Leaf, Fish, WheatOff, AlertCircle, Loader2 } from 'lucide-react'; // Added Loader2, AlertCircle
import type { User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { UserProfile, UserRole } from '@/services/userService';
import { getMenuItems, type MenuItem as MenuItemFromService, type DietaryTag as DietaryTagFromService } from '@/services/menuService'; // Import from menuService
import { Skeleton } from '@/components/ui/skeleton'; // Added Skeleton
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert

// Re-export or use DietaryTagFromService directly
export type DietaryTag = DietaryTagFromService;

// MenuItem for display will include the dynamically calculated price
export interface MenuItem extends MenuItemFromService {
  // price here will be the role-adjusted display price
}

// This function determines the final display price based on meal type and user role
const getDisplayPrice = (mealType: 'Breakfast' | 'Lunch' | 'Dinner', role: UserRole | null | undefined): number => {
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

const dietaryTagIcons: Record<DietaryTag, React.ReactElement> = {
  'Vegetarian': <Leaf className="h-4 w-4 text-green-500" />,
  'Vegan': <Carrot className="h-4 w-4 text-orange-500" />,
  'Gluten-Free': <WheatOff className="h-4 w-4 text-yellow-500" />,
  'Non-Veg': <Fish className="h-4 w-4 text-blue-500" />,
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface MenuDisplayProps {
  currentUser: FirebaseUser | null;
  currentUserProfile: UserProfile | null;
  onMealSelect: (meal: MenuItem, isSelected: boolean) => void;
  selectedMeals: MenuItem[];
}

export const MenuDisplay: FC<MenuDisplayProps> = ({ currentUser, currentUserProfile, onMealSelect, selectedMeals }) => {
  const [menuItemsFromFirestore, setMenuItemsFromFirestore] = useState<MenuItemFromService[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<DietaryTag | 'All'>('All');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      setMenuError(null);
      try {
        const items = await getMenuItems();
        setMenuItemsFromFirestore(items);
      } catch (err) {
        console.error("Failed to fetch menu for display:", err);
        setMenuError("Could not load the menu. Please try refreshing the page.");
        toast({ title: "Error", description: "Failed to load menu items.", variant: "destructive" });
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, [toast]);

  // Calculate display prices based on fetched items and user role
  const menuItemsForDisplay: MenuItem[] = useMemo(() => {
    const role = currentUserProfile?.role || null;
    return menuItemsFromFirestore.map(item => ({
      ...item, // item already has base details like name, description, calories, dietaryTags, and its original admin-set price
      price: getDisplayPrice(item.mealType, role), // Override price with role-specific display price
    }));
  }, [menuItemsFromFirestore, currentUserProfile]);


  const filteredMenu = useMemo(() => {
    return menuItemsForDisplay
      .filter(item => item.day === selectedDay)
      .filter(item => filter === 'All' || item.dietaryTags.includes(filter));
  }, [menuItemsForDisplay, filter, selectedDay]);

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
                disabled={isLoadingMenu}
              >
                {day}
              </Button>
            ))}
          </div>
          <Select onValueChange={handleFilterChange} defaultValue="All" disabled={isLoadingMenu}>
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

        {isLoadingMenu ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : menuError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Menu</AlertTitle>
            <AlertDescription>{menuError}</AlertDescription>
          </Alert>
        ) : filteredMenu.length > 0 ? (
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
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
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
          <p className="text-center text-muted-foreground py-4">
            {menuItemsFromFirestore.length === 0 ? "The menu is currently empty." : `No meals match your current filter for ${selectedDay}.`}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
