
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Utensils, ArrowLeft, Carrot, Leaf, Fish, WheatOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, type MenuItem, type MenuItemData, type DietaryTag } from "@/services/menuService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const ALL_DIETARY_TAGS: DietaryTag[] = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Non-Veg'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: MenuItem['mealType'][] = ['Breakfast', 'Lunch', 'Dinner'];

const getPriceSuggestion = (mealType: 'Breakfast' | 'Lunch' | 'Dinner'): number => {
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

const defaultNewItemForm: Omit<MenuItem, 'id'> = {
  day: 'Monday',
  mealType: 'Breakfast',
  name: '',
  description: '',
  dietaryTags: [],
  calories: 0,
  price: getPriceSuggestion('Breakfast'),
};


export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentItemForm, setCurrentItemForm] = useState<Omit<MenuItem, 'id'>>(defaultNewItemForm);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setError("Failed to load menu items. Please try again.");
      toast({ title: "Error", description: "Could not fetch menu items.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddNewClick = () => {
    setEditingItem(null);
    setCurrentItemForm({ ...defaultNewItemForm, price: getPriceSuggestion(defaultNewItemForm.mealType) });
    setIsFormOpen(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setCurrentItemForm({ ...item }); // item includes id, but form is Omit<MenuItem, 'id'>, this is fine.
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMenuItem(itemToDelete.id);
        toast({ title: "Item Deleted", description: `${itemToDelete.name} has been removed.` });
        setItemToDelete(null);
        fetchMenuItems(); // Re-fetch to update list
      } catch (err) {
        toast({ title: "Error", description: `Failed to delete ${itemToDelete.name}.`, variant: "destructive" });
      }
    }
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItemForm(prev => ({
      ...prev,
      [name]: name === 'calories' || name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: 'day' | 'mealType', value: string) => {
    setCurrentItemForm(prev => {
        const updatedForm = { ...prev, [name]: value };
        if (name === 'mealType') {
            updatedForm.price = getPriceSuggestion(value as MenuItem['mealType']);
        }
        return updatedForm;
    });
  };

  const handleDietaryTagChange = (tag: DietaryTag, checked: boolean) => {
    setCurrentItemForm(prev => {
      const newTags = checked
        ? [...prev.dietaryTags, tag]
        : prev.dietaryTags.filter(t => t !== tag);
      return { ...prev, dietaryTags: newTags };
    });
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentItemForm.name.trim()) {
        toast({ title: "Validation Error", description: "Item name cannot be empty.", variant: "destructive" });
        return;
    }
    if (currentItemForm.calories < 0 || currentItemForm.price < 0) {
        toast({ title: "Validation Error", description: "Calories and price cannot be negative.", variant: "destructive" });
        return;
    }

    setFormSubmitting(true);
    const itemDataToSave: MenuItemData = { ...currentItemForm };

    try {
      if (editingItem) { // Edit mode
        await updateMenuItem(editingItem.id, itemDataToSave);
        toast({ title: "Item Updated", description: `${currentItemForm.name} has been successfully updated.` });
      } else { // Add mode
        await addMenuItem(itemDataToSave);
        toast({ title: "Item Added", description: `${currentItemForm.name} has been successfully added.` });
      }
      setIsFormOpen(false);
      setEditingItem(null);
      fetchMenuItems(); // Re-fetch to update list
    } catch (err) {
      toast({ title: "Error", description: "Failed to save item. Please try again.", variant: "destructive" });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary">
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
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-primary">Menu Management</h2>
          <Button onClick={handleAddNewClick} disabled={isLoading}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
          </Button>
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Menu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Dialog open={isFormOpen} onOpenChange={(open) => { if (!formSubmitting) setIsFormOpen(open); }}>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmitForm}>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Modify the details of the existing menu item.' : 'Fill in the details for the new menu item.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" value={currentItemForm.name} onChange={handleFormInputChange} className="col-span-3" required disabled={formSubmitting} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea id="description" name="description" value={currentItemForm.description} onChange={handleFormInputChange} className="col-span-3" disabled={formSubmitting} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="day" className="text-right">Day</Label>
                  <Select name="day" value={currentItemForm.day} onValueChange={(value) => handleSelectChange('day', value)} disabled={formSubmitting}>
                    <SelectTrigger className="col-span-3"> <SelectValue placeholder="Select day" /> </SelectTrigger>
                    <SelectContent> {DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)} </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mealType" className="text-right">Meal Type</Label>
                  <Select name="mealType" value={currentItemForm.mealType} onValueChange={(value) => handleSelectChange('mealType', value)} disabled={formSubmitting}>
                    <SelectTrigger className="col-span-3"> <SelectValue placeholder="Select meal type" /> </SelectTrigger>
                    <SelectContent> {MEAL_TYPES.map(mt => <SelectItem key={mt} value={mt}>{mt}</SelectItem>)} </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="calories" className="text-right">Calories</Label>
                  <Input id="calories" name="calories" type="number" value={currentItemForm.calories} onChange={handleFormInputChange} className="col-span-3" min="0" disabled={formSubmitting} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price (₹)</Label>
                  <Input id="price" name="price" type="number" value={currentItemForm.price} onChange={handleFormInputChange} className="col-span-3" min="0" step="0.01" disabled={formSubmitting} />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Dietary Tags</Label>
                  <div className="col-span-3 space-y-2">
                    {ALL_DIETARY_TAGS.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dietary-${tag}`}
                          checked={currentItemForm.dietaryTags.includes(tag)}
                          onCheckedChange={(checked) => handleDietaryTagChange(tag, !!checked)}
                          disabled={formSubmitting}
                        />
                        <Label htmlFor={`dietary-${tag}`} className="font-normal flex items-center gap-1">
                          {dietaryTagIcons[tag]} {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={formSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={formSubmitting}>
                  {formSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item "{itemToDelete?.name}" from the menu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Menu Items</CardTitle>
            <CardDescription>View, edit, or delete existing menu items. Changes will reflect on the user-facing menu.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : menuItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Dietary Tags</TableHead>
                    <TableHead className="text-right">Calories</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.sort((a,b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day) || MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType) )
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.day}</TableCell>
                      <TableCell>{item.mealType}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.dietaryTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1 capitalize">
                              {dietaryTagIcons[tag]} {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.calories} kcal</TableCell>
                       <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                      <TableCell className="space-x-1 whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
                 <p className="text-center text-muted-foreground py-4">
                   {error ? "Could not load menu items." : "No menu items available. Click \"Add New Item\" to get started."}
                 </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
