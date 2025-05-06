'use client';

import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Added import for Button
import { Carrot, Leaf, Fish, WheatOff } from 'lucide-react'; // Example icons

interface MenuItem {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  description: string;
  dietaryTags: DietaryTag[];
  calories: number;
  price: number; // Added price for potential order summary
}

type DietaryTag = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Non-Veg';

const initialMenuData: MenuItem[] = [
  { id: '1', day: 'Monday', mealType: 'Breakfast', name: 'Scrambled Eggs & Toast', description: 'Classic scrambled eggs with whole wheat toast.', dietaryTags: ['Non-Veg'], calories: 350, price: 5.00 },
  { id: '2', day: 'Monday', mealType: 'Lunch', name: 'Chicken Salad Sandwich', description: 'Grilled chicken salad on multigrain bread.', dietaryTags: ['Non-Veg'], calories: 550, price: 8.00 },
  { id: '3', day: 'Monday', mealType: 'Dinner', name: 'Lentil Soup', description: 'Hearty lentil soup with vegetables.', dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free'], calories: 400, price: 7.00 },
  { id: '4', day: 'Tuesday', mealType: 'Breakfast', name: 'Oatmeal with Berries', description: 'Warm oatmeal topped with mixed berries and nuts.', dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free'], calories: 300, price: 4.50 },
  { id: '5', day: 'Tuesday', mealType: 'Lunch', name: 'Quinoa Salad', description: 'Refreshing quinoa salad with cucumber, tomatoes, and feta.', dietaryTags: ['Vegetarian', 'Gluten-Free'], calories: 450, price: 7.50 },
  { id: '6', day: 'Tuesday', mealType: 'Dinner', name: 'Grilled Salmon', description: 'Salmon fillet grilled to perfection with roasted asparagus.', dietaryTags: ['Non-Veg', 'Gluten-Free'], calories: 600, price: 10.00 },
  { id: '7', day: 'Wednesday', mealType: 'Breakfast', name: 'Pancakes', description: 'Fluffy pancakes with maple syrup.', dietaryTags: ['Vegetarian'], calories: 450, price: 6.00 },
  { id: '8', day: 'Wednesday', mealType: 'Lunch', name: 'Vegetable Stir-fry', description: 'Mixed vegetables stir-fried with tofu and soy sauce.', dietaryTags: ['Vegan', 'Vegetarian'], calories: 500, price: 8.50 },
  { id: '9', day: 'Wednesday', mealType: 'Dinner', name: 'Spaghetti Bolognese', description: 'Classic spaghetti with a rich meat sauce.', dietaryTags: ['Non-Veg'], calories: 650, price: 9.00 },
  // Add more items for other days and meals
];


const dietaryTagIcons: Record<DietaryTag, React.ReactElement> = {
  'Vegetarian': <Leaf className="h-4 w-4 text-green-500" />,
  'Vegan': <Carrot className="h-4 w-4 text-orange-500" />,
  'Gluten-Free': <WheatOff className="h-4 w-4 text-yellow-500" />,
  'Non-Veg': <Fish className="h-4 w-4 text-blue-500" />,
};

export const MenuDisplay: FC = () => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState<DietaryTag | 'All'>('All');
  const [selectedDay, setSelectedDay] = useState<string>('Monday'); // Default to Monday

  useEffect(() => {
    // Simulate fetching data
    setMenuData(initialMenuData);
  }, []);

  const daysOfWeek = useMemo(() => Array.from(new Set(menuData.map(item => item.day))), [menuData]);

  const filteredMenu = useMemo(() => {
    return menuData
      .filter(item => item.day === selectedDay)
      .filter(item => filter === 'All' || item.dietaryTags.includes(filter));
  }, [menuData, filter, selectedDay]);

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as DietaryTag | 'All');
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Weekly Menu</CardTitle>
        <CardDescription>Explore our delicious and healthy meal options for the week.</CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMenu.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.mealType}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.dietaryTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 capitalize">
                          {dietaryTagIcons[tag]}
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.calories} kcal</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-4">No meals match your current filter for {selectedDay}.</p>
        )}
      </CardContent>
    </Card>
  );
};
