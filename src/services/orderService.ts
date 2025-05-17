
'use server';

import { Timestamp, addDoc, collection, doc, getDoc } from 'firebase/firestore';
import type { MenuItem } from '@/components/menu-display';
import { db } from './firebase'; 

export interface OrderData {
  id?: string; // Firestore document ID, added after fetching
  userEmail: string;
  userName?: string; // User's display name
  selectedMeals: MenuItem[];
  totalCost: number;
  createdAt: Timestamp;
}

const ordersCollection = collection(db, 'orders');

/**
 * Saves an order to Firestore.
 * @param orderData - The order details to save. Includes userEmail, selectedMeals, totalCost, and optionally userName.
 * @returns The ID of the newly created order document.
 */
export async function saveOrder(orderData: Omit<OrderData, 'id' | 'createdAt'>): Promise<string> {
  try {
    const orderToSave = {
      ...orderData, // This will include userEmail, selectedMeals, totalCost, and userName if provided
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(ordersCollection, orderToSave);
    return docRef.id;
  } catch (error: any) {
    console.error(
      "Error saving order to Firestore:", 
      error.message, 
      error.code ? `(Code: ${error.code})` : '', 
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error("Could not save order. Check server logs for details.");
  }
}

/**
 * Retrieves a specific order from Firestore by its ID.
 * @param orderId - The ID of the order to retrieve.
 * @returns The order data (including userName if saved) if found, otherwise null.
 */
export async function getOrderById(orderId: string): Promise<OrderData | null> {
  try {
    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
        console.warn(`Attempted to fetch order with invalid ID: "${orderId}"`);
        return null;
    }
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Ensure the data conforms to OrderData, especially the optional userName
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        userEmail: data.userEmail,
        userName: data.userName, // This will be undefined if not set, which is fine for optional field
        selectedMeals: data.selectedMeals,
        totalCost: data.totalCost,
        createdAt: data.createdAt,
      } as OrderData;
    } else {
      console.log(`No order found with ID: ${orderId}`);
      return null;
    }
  } catch (error: any) {
    console.error(
        `Error fetching order ${orderId} from Firestore:`, 
        error.message, 
        error.code ? `(Code: ${error.code})` : '', 
        error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error(`Could not fetch order details for ID: ${orderId}. Check server logs for details.`);
  }
}
