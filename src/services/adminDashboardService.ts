
// src/services/adminDashboardService.ts
'use server';

import { collection, getDocs, query, orderBy, limit as firestoreLimit, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import type { OrderData } from './orderService';
import { format } from 'date-fns';
import { getAllUserProfiles, type UserProfile, type UserRole } from './userService'; // Import UserRole

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
  role?: UserRole; // Optional: for displaying user role if needed
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
 * Fetches and processes sales data for the Sales Report page, optionally filtered by a date range and user role.
 * @param range - Optional date range to filter sales data.
 * @param roleFilter - Optional role to filter sales data by ('Student', 'Staff', 'Admin', or 'All').
 */
export async function getSalesReports(
  range?: { from?: Date; to?: Date },
  roleFilter: UserRole | 'All' = 'All'
): Promise<SalesReport> {
  const ordersCollectionRef = collection(db, 'orders');
  let q;

  if (range?.from && range?.to) {
    const toDate = new Date(range.to);
    toDate.setHours(23, 59, 59, 999);
    q = query(
      ordersCollectionRef,
      orderBy('createdAt', 'asc'),
      where('createdAt', '>=', Timestamp.fromDate(range.from)),
      where('createdAt', '<=', Timestamp.fromDate(toDate))
    );
  } else {
    q = query(ordersCollectionRef, orderBy('createdAt', 'asc'));
  }

  const querySnapshot = await getDocs(q);

  const allUserProfiles = await getAllUserProfiles();
  const userRolesMap = new Map<string, UserRole>();
  allUserProfiles.forEach(profile => {
    if (profile.email) {
      userRolesMap.set(profile.email, profile.role);
    }
  });

  const dailySales: { [key: string]: { totalSales: number; orderCount: number } } = {};
  const detailedSales: DetailedSaleItem[] = [];
  let overallTotalSales = 0;
  let overallTotalOrders = 0;

  querySnapshot.docs.forEach((doc) => {
    const order = { id: doc.id, ...doc.data() } as OrderData;
    const orderDate = (order.createdAt as Timestamp).toDate();
    const dayKey = format(orderDate, "yyyy-MM-dd");

    const userRole = userRolesMap.get(order.userEmail) || 'Student'; // Default to Student

    if (roleFilter !== 'All' && userRole !== roleFilter) {
      return; // Skip this order if it doesn't match the role filter
    }

    if (!dailySales[dayKey]) {
      dailySales[dayKey] = { totalSales: 0, orderCount: 0 };
    }
    dailySales[dayKey].totalSales += order.totalCost;
    dailySales[dayKey].orderCount++;

    detailedSales.push({
      id: order.id || doc.id,
      date: format(orderDate, "PP"),
      user: order.userName || order.userEmail,
      itemsCount: order.selectedMeals.length,
      totalAmount: order.totalCost,
      role: userRole, // Store the role for potential display
    });

    overallTotalSales += order.totalCost;
    overallTotalOrders++;
  });

  const chartData: SalesReportChartItem[] = Object.entries(dailySales)
    .map(([date, data]) => ({
      date,
      totalSales: data.totalSales,
      orderCount: data.orderCount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    chartData,
    detailedSales: detailedSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    summary: {
      totalSales: overallTotalSales,
      totalOrders: overallTotalOrders,
    },
  };
}
