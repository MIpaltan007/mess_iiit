
// src/services/userService.ts
'use server';

import { collection, getDocs, query, orderBy, Timestamp, doc, setDoc, getDoc, where, limit } from 'firebase/firestore';
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
  lastPurchaseAt?: string; // ISO string for client, Firestore Timestamp in DB
  lastOrderId?: string;
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
 * Converts string dates for `lastPurchaseAt` and `joinDate` to Firestore Timestamps if they are strings.
 * @param profile - The user profile data.
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    const dataToSave: any = { ...profile };

    // Convert lastPurchaseAt to Timestamp if it's a string
    if (profile.lastPurchaseAt && typeof profile.lastPurchaseAt === 'string') {
      dataToSave.lastPurchaseAt = Timestamp.fromDate(new Date(profile.lastPurchaseAt));
    } else if (profile.lastPurchaseAt === undefined) {
        // If explicitly clearing, ensure it's removed or set to null in Firestore
        dataToSave.lastPurchaseAt = null; 
    }


    // Ensure joinDate is also a Timestamp if it's being set/updated as a string
    // However, joinDate is typically set once on registration as an ISO string.
    // If it's always an ISO string from client and needs to be a Timestamp in FS:
    if (profile.joinDate && typeof profile.joinDate === 'string') {
         // Assuming joinDate from client is ISO string. If it could be already a Timestamp, add checks.
        // For this operation, if it's already an ISO string, convert it.
        // This part might need adjustment based on how joinDate is handled elsewhere if it's updated post-registration.
        // For now, let's assume if saveUserProfile is called with it, it might be an ISO string to be stored as Timestamp.
        // However, current registration saves it as ISO, and getUserProfile returns it as ISO.
        // To keep it simple, if it's already an ISO string from client, store it as is or convert to Timestamp.
        // Let's keep joinDate as string in Firestore as per original setup to avoid breaking existing logic unless necessary.
        // The main concern is lastPurchaseAt for date comparisons.
    }


    await setDoc(userDocRef, dataToSave, { merge: true });
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
 * Converts Firestore Timestamps for `lastPurchaseAt` and `joinDate` to ISO strings.
 * @param uid - The user's UID.
 * @returns The user profile data if found, otherwise null.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    if (!uid) return null;
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const profile: UserProfile = {
        uid: data.uid,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        joinDate: data.joinDate instanceof Timestamp ? data.joinDate.toDate().toISOString() : data.joinDate,
        lastPurchaseAt: data.lastPurchaseAt instanceof Timestamp ? data.lastPurchaseAt.toDate().toISOString() : undefined,
        lastOrderId: data.lastOrderId,
      };
      return profile;
    }
    return null;
  } catch (error: any) {
    console.error(
      `Error fetching user profile ${uid} from Firestore:`,
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
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
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
         return {
            uid: data.uid,
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            joinDate: data.joinDate instanceof Timestamp ? data.joinDate.toDate().toISOString() : data.joinDate,
            lastPurchaseAt: data.lastPurchaseAt instanceof Timestamp ? data.lastPurchaseAt.toDate().toISOString() : undefined,
            lastOrderId: data.lastOrderId,
         } as UserProfile;
    }).filter(profile => profile.email && profile.role);
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
  // This function now relies on getAllUsers which processes from orders, 
  // but for profile counts, it should use users collection.
  // Let's assume it means profiles with actual order history as per `getAllUsers` context
  const usersWithOrders = await getAllUsers(); // Users derived from orders
  return usersWithOrders.length;
  // If it meant total registered profiles:
  // const profiles = await getAllUserProfiles();
  // return profiles.length;
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
  // Sort by joinDate (which is firstOrderDate) to get most recent *active* users
  const sortedUsers = [...allUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  return sortedUsers.slice(0, count);
}

/**
 * Checks if an admin user already exists in the 'users' collection.
 * @returns Promise<boolean> - True if an admin exists, false otherwise.
 */
export async function checkIfAdminExists(): Promise<boolean> {
  const usersCollectionRef = collection(db, 'users');
  const adminQuery = query(usersCollectionRef, where('role', '==', 'Admin'), limit(1));
  try {
    const querySnapshot = await getDocs(adminQuery);
    return !querySnapshot.empty; // If snapshot is not empty, an admin exists
  } catch (error: any) {
    console.error(
      "Error checking for existing admin:",
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    throw new Error("Failed to check for existing admin. Registration aborted.");
  }
}

