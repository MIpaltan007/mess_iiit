// src/services/userService.ts
'use server';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { OrderData } from './orderService';

export interface User {
  id: string; // userEmail will serve as ID for this context
  name: string;
  email: string;
  totalMealCost: number;
  joinDate: string; // ISO string date of the first order
}

// Mock data is no longer the primary source for getAllUsers
const mockUsersData_legacy: Omit<User, 'totalMealCost'>[] = [
  { id: "U001", name: "Alice Smith", email: "alice.smith@example.com", joinDate: "2024-07-15" },
  { id: "U002", name: "Bob Johnson", email: "bob.johnson@example.com", joinDate: "2024-07-01" },
];


export async function getTotalUsersCount(): Promise<number> {
  // This would ideally count distinct users from the 'users' collection or Firebase Auth.
  // For now, we'll count distinct users based on orders as a proxy.
  const users = await getAllUsers();
  return users.length;
}

/**
 * Fetches all users based on their order history from Firestore.
 * Aggregates total meal costs and determines the first order date.
 */
export async function getAllUsers(): Promise<User[]> {
  const ordersCollectionRef = collection(db, 'orders');
  const q = query(ordersCollectionRef, orderBy('createdAt', 'asc')); // Order by creation to easily find first order

  try {
    const querySnapshot = await getDocs(q);
    const usersMap = new Map<string, { name: string; email: string; totalMealCost: number; firstOrderDate: Date }>();

    querySnapshot.docs.forEach((doc) => {
      const order = doc.data() as Omit<OrderData, 'id'>; // Cast to OrderData excluding id

      if (!order.userEmail) return; // Skip if no email

      const existingUser = usersMap.get(order.userEmail);
      const orderDate = (order.createdAt as Timestamp).toDate();

      if (existingUser) {
        existingUser.totalMealCost += order.totalCost;
        // Update name if current order has one and previous didn't, or if it's a more "complete" name (heuristic)
        if (order.userName && (!existingUser.name || order.userName.length > existingUser.name.length)) {
            existingUser.name = order.userName;
        }
        // Keep the earliest order date
        if (orderDate < existingUser.firstOrderDate) {
          existingUser.firstOrderDate = orderDate;
        }
      } else {
        usersMap.set(order.userEmail, {
          email: order.userEmail,
          name: order.userName || order.userEmail, // Fallback to email if name is not present
          totalMealCost: order.totalCost,
          firstOrderDate: orderDate,
        });
      }
    });

    const usersArray: User[] = Array.from(usersMap.entries()).map(([email, data]) => ({
      id: email, // Use email as ID
      email: data.email,
      name: data.name,
      totalMealCost: data.totalMealCost,
      joinDate: data.firstOrderDate.toISOString(), // Store as ISO string
    }));

    // Sort by name for consistent display
    return usersArray.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error: any) {
    console.error(
      "Error fetching users from orders:", 
      error.message, 
      error.code ? `(Code: ${error.code})` : '', 
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    // In case of error, return an empty array or re-throw, depending on desired error handling
    return []; 
  }
}

/**
 * Simulates fetching a list of recent users. (Not currently used by User Management page)
 * In a real app, this would query Firestore, ordering by joinDate.
 * @param count - The number of recent users to fetch.
 */
export async function getRecentUsers(count: number): Promise<User[]> {
  const allUsers = await getAllUsers(); // Leverages the new getAllUsers logic
  const sortedUsers = [...allUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  return sortedUsers.slice(0, count);
}
