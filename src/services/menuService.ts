
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
// This interface is used for data being WRITTEN to Firestore.
// Firestore Timestamps are appropriate here for `createdAt` and `updatedAt` if set by server.
export interface MenuItemData {
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  description: string;
  dietaryTags: DietaryTag[];
  calories: number;
  price: number; // Base price set by admin
  createdAt?: Timestamp; // Used by addMenuItem/updateMenuItem with Timestamp.now()
  updatedAt?: Timestamp; // Used by addMenuItem/updateMenuItem with Timestamp.now()
}

// Interface for a menu item including its Firestore document ID and SERIALIZED dates for client use.
// This is what client components will receive and store in state.
export interface MenuItem {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  description: string;
  dietaryTags: DietaryTag[];
  calories: number;
  price: number;
  createdAt?: string; // Serialized for client (ISO string)
  updatedAt?: string; // Serialized for client (ISO string)
}

const menuItemsCollection = collection(db, 'menuItems');

/**
 * Fetches all menu items from Firestore, ordered by a potential 'createdAt' or 'name' field.
 * Converts Firestore Timestamps to ISO strings for client-side compatibility.
 * @returns Promise<MenuItem[]>
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const q = query(menuItemsCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docInstance => {
      const data = docInstance.data();
      // Ensure all fields are correctly mapped and Timestamps are converted
      return {
        id: docInstance.id,
        day: data.day,
        mealType: data.mealType,
        name: data.name,
        description: data.description,
        dietaryTags: data.dietaryTags || [],
        calories: data.calories,
        price: data.price,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : undefined,
      } as MenuItem; // Cast to MenuItem which expects string dates
    });
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
 * @param itemData - The menu item data (without id). Uses MenuItemData which can have Timestamps for creation.
 * @returns Promise<string> - The ID of the newly created menu item.
 */
export async function addMenuItem(itemData: Omit<MenuItemData, 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const dataWithTimestamp: MenuItemData = { // Explicitly type for clarity
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
 * @param itemData - The partial data to update for the menu item. Uses MenuItemData.
 * @returns Promise<void>
 */
export async function updateMenuItem(itemId: string, itemData: Partial<Omit<MenuItemData, 'createdAt' | 'updatedAt'>>): Promise<void> {
  try {
    if (!itemId) throw new Error("Item ID is required for update.");
    const itemDocRef = doc(db, 'menuItems', itemId);
    const dataWithTimestamp: Partial<MenuItemData> = { // Explicitly type for clarity
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
