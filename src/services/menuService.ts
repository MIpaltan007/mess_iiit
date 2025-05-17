
// src/services/menuService.ts
'use server';

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Consistent type definition for dietary tags
export type DietaryTag = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Non-Veg';

// Interface for the data structure of a menu item when creating (without id)
export interface MenuItemData {
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  description: string;
  dietaryTags: DietaryTag[];
  calories: number;
  price: number; // Base price set by admin (e.g., student price)
  createdAt?: Timestamp; // Optional: for ordering or tracking
  updatedAt?: Timestamp; // Optional: for tracking updates
}

// Interface for a menu item including its Firestore document ID
export interface MenuItem extends MenuItemData {
  id: string;
}

const menuItemsCollection = collection(db, 'menuItems');

/**
 * Fetches all menu items from Firestore, ordered by a potential 'createdAt' or 'name' field.
 * @returns Promise<MenuItem[]>
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    // Example: Order by day then mealType, then name. You might need to create composite indexes in Firestore.
    // For simplicity, let's assume we might want to order by name or a createdAt field if available.
    // If you add a createdAt field, use: query(menuItemsCollection, orderBy('createdAt', 'asc'));
    const q = query(menuItemsCollection, orderBy('name', 'asc')); // Simple ordering by name
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
  } catch (error: any) {
    console.error(
      "Error fetching menu items:",
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error("Could not fetch menu items. Check server logs.");
  }
}

/**
 * Adds a new menu item to Firestore.
 * @param itemData - The menu item data (without id).
 * @returns Promise<string> - The ID of the newly created menu item.
 */
export async function addMenuItem(itemData: MenuItemData): Promise<string> {
  try {
    const dataWithTimestamp = {
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(menuItemsCollection, dataWithTimestamp);
    return docRef.id;
  } catch (error: any) {
    console.error(
      "Error adding menu item:",
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error("Could not add menu item. Check server logs.");
  }
}

/**
 * Updates an existing menu item in Firestore.
 * @param itemId - The ID of the menu item to update.
 * @param itemData - The partial data to update for the menu item.
 * @returns Promise<void>
 */
export async function updateMenuItem(itemId: string, itemData: Partial<MenuItemData>): Promise<void> {
  try {
    if (!itemId) throw new Error("Item ID is required for update.");
    const itemDocRef = doc(db, 'menuItems', itemId);
    const dataWithTimestamp = {
      ...itemData,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(itemDocRef, dataWithTimestamp);
  } catch (error: any) {
    console.error(
      `Error updating menu item ${itemId}:`,
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error(`Could not update menu item ${itemId}. Check server logs.`);
  }
}

/**
 * Deletes a menu item from Firestore.
 * @param itemId - The ID of the menu item to delete.
 * @returns Promise<void>
 */
export async function deleteMenuItem(itemId: string): Promise<void> {
  try {
    if (!itemId) throw new Error("Item ID is required for deletion.");
    const itemDocRef = doc(db, 'menuItems', itemId);
    await deleteDoc(itemDocRef);
  } catch (error: any) {
    console.error(
      `Error deleting menu item ${itemId}:`,
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error(`Could not delete menu item ${itemId}. Check server logs.`);
  }
}
