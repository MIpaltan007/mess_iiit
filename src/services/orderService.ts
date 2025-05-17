
'use server';

import { Timestamp, addDoc, collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import type { MenuItem } from '@/components/menu-display';
import { app } from './firebase';

export interface OrderData {
  id?: string; // Firestore document ID, added after fetching
  userEmail: string;
  selectedMeals: MenuItem[];
  totalCost: number;
  createdAt: Timestamp;
}

const db = getFirestore(app);
const ordersCollection = collection(db, 'orders');

/**
 * Saves an order to Firestore.
 * @param orderData - The order details to save.
 * @returns The ID of the newly created order document.
 */
export async function saveOrder(orderData: Omit<OrderData, 'id' | 'createdAt'>): Promise<string> {
  try {
    const orderToSave = {
      ...orderData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(ordersCollection, orderToSave);
    return docRef.id;
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    throw new Error("Could not save order.");
  }
}

/**
 * Retrieves a specific order from Firestore by its ID.
 * @param orderId - The ID of the order to retrieve.
 * @returns The order data if found, otherwise null.
 */
export async function getOrderById(orderId: string): Promise<OrderData | null> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as OrderData;
    } else {
      console.log("No such order found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching order from Firestore:", error);
    throw new Error("Could not fetch order details.");
  }
}
