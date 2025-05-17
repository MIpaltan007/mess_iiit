// src/services/userService.ts
'use server';

// import { getFirestore, collection, getDocs, query, orderBy, limit as firestoreLimit,getCountFromServer } from 'firebase/firestore';
// import { app } from './firebase'; // Assuming firebase is initialized in './firebase'

export interface User {
  id: string;
  name: string;
  email: string;
  currentPlan?: string;
  joinDate: string;
  role?: 'Student' | 'Admin' | 'Staff'; // Optional role, as it's in user-management but not on dashboard mock
}

// Mock user data - in a real app, this would come from Firestore
const mockUsersData: User[] = [
  { id: "U001", name: "Alice Smith", email: "alice@example.com", currentPlan: "Full Feast", joinDate: "2024-07-15" },
  { id: "U002", name: "Bob Johnson", email: "bob@example.com", currentPlan: "Daily Delights", joinDate: "2024-07-01" },
  { id: "U003", name: "Carol Williams", email: "carol@example.com", currentPlan: "Basic Bites", joinDate: "2024-06-20" },
  { id: "U004", name: "David Brown", email: "david@example.com", currentPlan: "Full Feast", joinDate: "2024-05-10" },
  { id: "U005", name: "Eve Davis", email: "eve@example.com", currentPlan: "Daily Delights", joinDate: "2024-04-02" },
];

/**
 * Simulates fetching the total number of users.
 * In a real app, this would query Firestore.
 */
export async function getTotalUsersCount(): Promise<number> {
  // const db = getFirestore(app);
  // const usersCollection = collection(db, 'users');
  // const snapshot = await getCountFromServer(usersCollection);
  // return snapshot.data().count;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsersData.length; // Return the count of mock users
}

/**
 * Simulates fetching a list of recent users.
 * In a real app, this would query Firestore, ordering by joinDate.
 * @param count - The number of recent users to fetch.
 */
export async function getRecentUsers(count: number): Promise<User[]> {
  // const db = getFirestore(app);
  // const usersCollection = collection(db, 'users');
  // const q = query(usersCollection, orderBy('joinDate', 'desc'), firestoreLimit(count));
  // const querySnapshot = await getDocs(q);
  // const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  // return users;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Sort mock users by joinDate (descending) and take the top 'count'
  const sortedUsers = [...mockUsersData].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  return sortedUsers.slice(0, count);
}
