
// src/services/adminDashboardService.ts
'use server';

import { collection, getDocs, query, orderBy, limit as firestoreLimit, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import type { OrderData } from './orderService'; 
import { format } from 'date-fns';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalMealsOrdered: number;
}

export interface SalesChartDataItem { // For Admin Dashboard main page
  month: string; // e.g., "Jul 2024"
  sales: number;
}

export interface RecentSaleRecord { // For Admin Dashboard main page
  id: string;
  user: string; 
  itemsSummary: string; 
  amount: number;
  date: string; 
}

// Types for Sales Report Page
export interface SalesReportChartItem { // For Sales Report page chart
  date: string; // YYYY-MM-DD for daily aggregation
  totalSales: number;
  orderCount: number;
}

export interface DetailedSaleItem { // For Sales Report page table
  id: string;
  date: string; // Formatted date string for display
  user: string;
  itemsCount: number;
  totalAmount: number;
}

export interface SalesReport {
  chartData: SalesReportChartItem[];
  detailedSales: DetailedSaleItem[];
  summary: {
    totalSales: number;
    totalOrders: number;
  };
}


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

    const date = (order.createdAt as Timestamp).toDate();
    const monthYear = format(date, "MMM yyyy"); // e.g. Jul 2024
    monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.totalCost;

    if (index < 5) {
      recentSalesRecords.push({
        id: order.id || `order-${index}`,
        user: order.userName || order.userEmail,
        itemsSummary: `${order.selectedMeals.length} meal(s)`,
        amount: order.totalCost,
        date: format(date, "P"), // e.g. 07/15/2024
      });
    }
  });

  const salesChartData: SalesChartDataItem[] = Object.entries(monthlySales)
    .map(([month, sales]) => ({ month, sales }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()); 

  return {
    stats: { totalRevenue, totalOrders, totalMealsOrdered },
    salesChartData,
    recentSales: recentSalesRecords,
  };
}


/**
 * Fetches and processes sales data for the Sales Report page, optionally filtered by a date range.
 * @param range - Optional date range to filter sales data.
 */
export async function getSalesReports(range?: { from?: Date; to?: Date }): Promise<SalesReport> {
  const ordersCollectionRef = collection(db, 'orders');
  let q;

  if (range?.from && range?.to) {
    // Ensure 'to' date includes the whole day
    const toDate = new Date(range.to);
    toDate.setHours(23, 59, 59, 999);
    q = query(
      ordersCollectionRef,
      orderBy('createdAt', 'asc'), // Order ascending for chronological processing
      where('createdAt', '>=', Timestamp.fromDate(range.from)),
      where('createdAt', '<=', Timestamp.fromDate(toDate))
    );
  } else {
    q = query(ordersCollectionRef, orderBy('createdAt', 'asc'));
  }

  const querySnapshot = await getDocs(q);

  const dailySales: { [key: string]: { totalSales: number; orderCount: number } } = {};
  const detailedSales: DetailedSaleItem[] = [];
  let overallTotalSales = 0;
  let overallTotalOrders = 0;

  querySnapshot.docs.forEach((doc) => {
    const order = { id: doc.id, ...doc.data() } as OrderData;
    const orderDate = (order.createdAt as Timestamp).toDate();
    const dayKey = format(orderDate, "yyyy-MM-dd");

    // Aggregate for chart data
    if (!dailySales[dayKey]) {
      dailySales[dayKey] = { totalSales: 0, orderCount: 0 };
    }
    dailySales[dayKey].totalSales += order.totalCost;
    dailySales[dayKey].orderCount++;

    // Prepare detailed sale item
    detailedSales.push({
      id: order.id || doc.id,
      date: format(orderDate, "PP"), // e.g., Jul 20, 2024
      user: order.userName || order.userEmail,
      itemsCount: order.selectedMeals.length,
      totalAmount: order.totalCost,
    });

    overallTotalSales += order.totalCost;
    overallTotalOrders++;
  });

  const chartData: SalesReportChartItem[] = Object.entries(dailySales)
    .map(([date, data]) => ({
      date, // Keep as yyyy-MM-dd for sorting and x-axis
      totalSales: data.totalSales,
      orderCount: data.orderCount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    chartData,
    detailedSales: detailedSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), // Sort detailed sales by most recent
    summary: {
      totalSales: overallTotalSales,
      totalOrders: overallTotalOrders,
    },
  };
}

    