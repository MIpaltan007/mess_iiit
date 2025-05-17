
// src/services/userService.ts
'use server';

import { collection, getDocs, query, orderBy, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { OrderData } from './orderService';

// Role definition
export type UserRole = 'Student' | 'Admin' | 'Staff';

// User profile structure (stored in 'users' collection)
export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  joinDate: string; // ISO string date
}

// User structure for admin listing (derived from orders)
export interface User {
  id: string; // userEmail will serve as ID for this context
  name: string;
  email: string;
  totalMealCost: number;
  joinDate: string; // ISO string date of the first order
}


/**
 * Saves or updates a user's profile in Firestore.
 * @param profile - The user profile data.
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(userDocRef, profile, { merge: true }); // Use merge to avoid overwriting if doc exists
  } catch (error: any) {
    console.error(
      "Error saving user profile to Firestore:",
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error("Could not save user profile. Check server logs for details.");
  }
}

/**
 * Fetches a user's profile from Firestore.
 * @param uid - The user's UID.
 * @returns The user profile data if found, otherwise null.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    if (!uid) return null;
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.error(
      `Error fetching user profile ${uid} from Firestore:`,
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    // Don't throw, return null so app can proceed with default role/prices
    return null;
  }
}

/**
 * Fetches all user profiles from Firestore.
 * @returns A promise that resolves to an array of UserProfile objects.
 */
export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const usersCollectionRef = collection(db, 'users');
  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile).filter(profile => profile.email && profile.role);
  } catch (error: any)
 {
    console.error(
      "Error fetching all user profiles:",
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    return []; // Return empty array on error
  }
}


export async function getTotalUsersCount(): Promise<number> {
  const users = await getAllUsers();
  return users.length;
}

export async function getAllUsers(): Promise<User[]> {
  const ordersCollectionRef = collection(db, 'orders');
  const q = query(ordersCollectionRef, orderBy('createdAt', 'asc'));

  try {
    const querySnapshot = await getDocs(q);
    const usersMap = new Map<string, { name: string; email: string; totalMealCost: number; firstOrderDate: Date }>();

    querySnapshot.docs.forEach((doc) => {
      const order = doc.data() as Omit<OrderData, 'id'>;
      if (!order.userEmail) return;

      const existingUser = usersMap.get(order.userEmail);
      const orderDate = (order.createdAt as Timestamp).toDate();

      if (existingUser) {
        existingUser.totalMealCost += order.totalCost;
        if (order.userName && (!existingUser.name || order.userName.length > existingUser.name.length)) {
            existingUser.name = order.userName;
        }
        if (orderDate < existingUser.firstOrderDate) {
          existingUser.firstOrderDate = orderDate;
        }
      } else {
        usersMap.set(order.userEmail, {
          email: order.userEmail,
          name: order.userName || order.userEmail,
          totalMealCost: order.totalCost,
          firstOrderDate: orderDate,
        });
      }
    });

    const usersArray: User[] = Array.from(usersMap.entries()).map(([email, data]) => ({
      id: email,
      email: data.email,
      name: data.name,
      totalMealCost: data.totalMealCost,
      joinDate: data.firstOrderDate.toISOString(),
    }));

    return usersArray.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error: any) {
    console.error(
      "Error fetching users from orders:",
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    return [];
  }
}

export async function getRecentUsers(count: number): Promise<User[]> {
  const allUsers = await getAllUsers();
  const sortedUsers = [...allUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  return sortedUsers.slice(0, count);
}
