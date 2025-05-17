// src/services/userService.ts
'use server';

// import { getFirestore, collection, getDocs, query, orderBy, limit as firestrokeLimit, getCountFromServer } from 'firebase/firestore';
// import { app } from './firebase'; // Assuming firebase is initialized in './firebase'

export interface User {
  id: string;
  name: string;
  email: string;
  currentPlan?: string;
  joinDate: string;
  role?: 'Student' | 'Admin' | 'Staff';
}

// Updated mock user data with roles
const mockUsersData: User[] = [
  { id: "U001", name: "Alice Smith", email: "alice.smith@example.com", currentPlan: "Full Feast", joinDate: "2024-07-15", role: "Student" },
  { id: "U002", name: "Bob Johnson", email: "bob.johnson@example.com", currentPlan: "Daily Delights", joinDate: "2024-07-01", role: "Student" },
  { id: "U003", name: "Charlie Admin", email: "charlie.admin@example.com", currentPlan: "Full Feast", joinDate: "2024-01-01", role: "Admin" },
  { id: "U004", name: "Diana Staff", email: "diana.staff@example.com", joinDate: "2024-03-01", role: "Staff" }, // No current plan
  { id: "U005", name: "Eve Davis", email: "eve.davis@example.com", currentPlan: "Basic Bites", joinDate: "2024-04-02", role: "Student" },
  { id: "U006", name: "Frank Green", email: "frank.green@example.com", joinDate: "2024-07-20", role: "Student" },
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
  
  const sortedUsers = [...mockUsersData].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  return sortedUsers.slice(0, count);
}

/**
 * Simulates fetching all users.
 * In a real app, this would query Firestore.
 */
export async function getAllUsers(): Promise<User[]> {
  // const db = getFirestore(app);
  // const usersCollection = collection(db, 'users');
  // const q = query(usersCollection, orderBy('name', 'asc')); // Example: order by name
  // const querySnapshot = await getDocs(q);
  // const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  // return users;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  return [...mockUsersData]; // Return a copy of the mock data
}
