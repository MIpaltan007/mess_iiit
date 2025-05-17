
// src/services/adminDashboardService.ts
'use server';

import { collection, getDocs, query, orderBy, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { OrderData } from './orderService'; // Assuming OrderData is exported from orderService

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalMealsOrdered: number;
}

export interface SalesChartDataItem {
  month: string;
  sales: number;
}

export interface RecentSaleRecord {
  id: string;
  user: string; // userName or userEmail
  itemsSummary: string; // e.g., "3 meals"
  amount: number;
  date: string; // Formatted date string
}

/**
 * Fetches and calculates overall dashboard statistics.
 */
export async function getDashboardData(): Promise<{
  stats: DashboardStats;
  salesChartData: SalesChartDataItem[];
  recentSales: RecentSaleRecord[];
}> {
  const ordersCollectionRef = collection(db, 'orders');
  const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  let totalRevenue = 0;
  let totalOrders = 0;
  let totalMealsOrdered = 0;
  const monthlySales: { [key: string]: number } = {};
  const recentSalesRecords: RecentSaleRecord[] = [];

  querySnapshot.docs.forEach((doc, index) => {
    const order = { id: doc.id, ...doc.data() } as OrderData;

    totalRevenue += order.totalCost;
    totalOrders++;
    totalMealsOrdered += order.selectedMeals.length;

    // Process for sales chart data
    const date = (order.createdAt as Timestamp).toDate();
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.totalCost;

    // Process for recent sales (take top 5)
    if (index < 5) {
      recentSalesRecords.push({
        id: order.id || `order-${index}`,
        user: order.userName || order.userEmail,
        itemsSummary: `${order.selectedMeals.length} meal(s)`,
        amount: order.totalCost,
        date: date.toLocaleDateString(),
      });
    }
  });

  const salesChartData: SalesChartDataItem[] = Object.entries(monthlySales)
    .map(([month, sales]) => ({ month, sales }))
    // Simple sort by date for chart - for robust sorting, convert month string to Date
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()); 

  return {
    stats: { totalRevenue, totalOrders, totalMealsOrdered },
    salesChartData,
    recentSales: recentSalesRecords,
  };
}
