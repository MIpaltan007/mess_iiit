'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Utensils, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MenuItem {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  description: string;
  dietaryTags: string[]; // e.g., ['Vegetarian', 'Gluten-Free']
  calories: number;
}

const initialMenuItems: MenuItem[] = [
  { id: '1', day: 'Monday', mealType: 'Breakfast', name: 'Scrambled Eggs', description: 'Fluffy scrambled eggs with a side of toast.', dietaryTags: ['Non-Veg'], calories: 300 },
  { id: '2', day: 'Monday', mealType: 'Lunch', name: 'Chicken Caesar Salad', description: 'Grilled chicken, romaine lettuce, croutons, and Caesar dressing.', dietaryTags: ['Non-Veg'], calories: 450 },
  { id: '3', day: 'Tuesday', mealType: 'Dinner', name: 'Vegetable Curry', description: 'Mixed vegetables in a mild coconut curry sauce.', dietaryTags: ['Vegan', 'Vegetarian'], calories: 400 },
];


export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);

  // TODO: Implement form handling for adding/editing items
  // TODO: Implement delete functionality

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar (consider making this a reusable component) */}
      <aside className="w-64 bg-card text-card-foreground p-4 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 text-primary">
          <Utensils className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <ArrowLeft className="h-5 w-5" /> Dashboard
            </a>
          </Link>
           <Link href="/admin/menu-management" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <Utensils className="h-5 w-5" /> Menu Management
            </a>
          </Link>
          {/* Add other admin links here */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-primary">Menu Management</h2>
          <Button onClick={() => { setIsAdding(true); setIsEditing(null); }}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
          </Button>
        </header>

        {isAdding || isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
              <CardDescription>{isEditing ? 'Modify the details of the existing menu item.' : 'Fill in the details for the new menu item.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* This would be a form. For brevity, it's simplified. */}
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" placeholder="e.g., Pasta Primavera" defaultValue={isEditing?.name || ''} />
              </div>
              <div>
                <Label htmlFor="itemDescription">Description</Label>
                <Textarea id="itemDescription" placeholder="Describe the item..." defaultValue={isEditing?.description || ''} />
              </div>
              {/* Add fields for Day, Meal Type, Dietary Tags, Calories etc. */}
              <div className="flex gap-4">
                 <Button variant="outline" onClick={() => { setIsAdding(false); setIsEditing(null); }}>Cancel</Button>
                 <Button>{isEditing ? 'Save Changes' : 'Add Item'}</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Current Menu Items</CardTitle>
              <CardDescription>View, edit, or delete existing menu items.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.day}</TableCell>
                      <TableCell>{item.mealType}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.calories} kcal</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => { setIsEditing(item); setIsAdding(false);}}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
