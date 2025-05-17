
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Users, ShoppingBag, Utensils, Bell, LogOut, Settings, FileText, QrCode, AlertCircle, DollarSign, Package, Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { getTotalUsersCount, type User as UserData } from "@/services/userService"; // getRecentUsers removed
import { getDashboardData, type DashboardStats, type SalesChartDataItem, type RecentSaleRecord } from "@/services/adminDashboardService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = 'force-dynamic'; // Opt into dynamic rendering

const initialChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
};

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  // recentUsers state and related logic removed
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesChartData, setSalesChartData] = useState<SalesChartDataItem[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSaleRecord[]>([]);
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState(initialChartConfig);


  useEffect(() => {
    async function fetchUsersData() {
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const count = await getTotalUsersCount();
        setTotalUsers(count);
        // Call to getRecentUsers removed
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUsersError("Failed to load user data.");
      } finally {
        setIsLoadingUsers(false);
      }
    }
    fetchUsersData();
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoadingDashboardData(true);
      setDashboardError(null);
      try {
        const data = await getDashboardData();
        setDashboardStats(data.stats);
        setSalesChartData(data.salesChartData);
        setRecentSales(data.recentSales);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setDashboardError("Failed to load dashboard data.");
      } finally {
        setIsLoadingDashboardData(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-card text-card-foreground p-4 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 text-primary">
          <Utensils className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <BarChart className="h-5 w-5" /> Dashboard
            </a>
          </Link>
          <Link href="/admin/menu-management" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <Utensils className="h-5 w-5" /> Menu Management
            </a>
          </Link>
          <Link href="/admin/user-management" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <Users className="h-5 w-5" /> User Management
            </a>
          </Link>
          <Link href="/admin/sales-reports" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <FileText className="h-5 w-5" /> Sales Reports
            </a>
          </Link>
           <Link href="/admin/coupon-validation" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <QrCode className="h-5 w-5" /> Coupon Validation
            </a>
          </Link>
          <Link href="/admin/notifications" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <Bell className="h-5 w-5" /> Notifications
            </a>
          </Link>
          <Link href="/admin/settings" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <Settings className="h-5 w-5" /> Settings
            </a>
          </Link>
        </nav>
        <div className="mt-auto">
           <Link href="/" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <LogOut className="h-5 w-5" /> Logout
            </a>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-primary">Dashboard Overview</h2>
          {/* Removed Generate Report Button */}
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <>
                  <Skeleton className="h-8 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : usersError ? (
                 <span className="text-sm text-destructive">{usersError.substring(0,25)}...</span>
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p> 
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingDashboardData ? (
                <>
                  <Skeleton className="h-8 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : dashboardError ? (
                <span className="text-sm text-destructive">{dashboardError.substring(0,25)}...</span>
              ) : (
                <>
                  <div className="text-2xl font-bold">₹{dashboardStats?.totalRevenue.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
             {isLoadingDashboardData ? (
                <>
                  <Skeleton className="h-8 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : dashboardError ? (
                <span className="text-sm text-destructive">{dashboardError.substring(0,25)}...</span>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.totalOrders || '0'}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meals Ordered</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingDashboardData ? (
                <>
                  <Skeleton className="h-8 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </>
              ) : dashboardError ? (
                <span className="text-sm text-destructive">{dashboardError.substring(0,25)}...</span>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.totalMealsOrdered || '0'}</div>
                  <p className="text-xs text-muted-foreground">Across all orders</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {(usersError || dashboardError) && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Dashboard Data</AlertTitle>
                <AlertDescription>
                    {usersError && <p>{usersError}</p>}
                    {dashboardError && <p>{dashboardError}</p>}
                    Please try refreshing the page.
                </AlertDescription>
            </Alert>
        )}

        {/* Sales Chart */}
        <div className="grid grid-cols-1 gap-8"> {/* Changed from lg:grid-cols-2 */}
          <Card className="lg:col-span-2"> {/* Added lg:col-span-2 to make sales chart take full width */}
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
              <CardDescription>Monthly sales overview.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoadingDashboardData ? (
                <Skeleton className="h-[300px] w-full" />
              ) : dashboardError ? (
                 <p className="text-sm text-muted-foreground text-center py-4">Could not load sales chart data.</p>
              ) : salesChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data available to display chart.</p>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <RechartsBarChart accessibilityLayer data={salesChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis />
                    <RechartsTooltip 
                        content={<ChartTooltipContent 
                            formatter={(value) => `₹${Number(value).toFixed(2)}`}
                        />} 
                    />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                  </RechartsBarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Users Card Removed */}
        </div>
        
        {/* Recent Sales */}
        <Card>
            <CardHeader>
              <CardTitle>Recent Sales Transactions</CardTitle>
              <CardDescription>A list of the latest meal plan purchases.</CardDescription>
            </CardHeader>
            <CardContent>
            {isLoadingDashboardData ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : dashboardError ? (
                 <p className="text-sm text-muted-foreground text-center py-4">Could not load recent sales.</p>
              ) : recentSales.length === 0 && !dashboardError ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent sales transactions found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.user}</TableCell>
                        <TableCell>{sale.itemsSummary}</TableCell>
                        <TableCell className="text-right">₹{sale.amount.toFixed(2)}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

      </main>
    </div>
  );
}

