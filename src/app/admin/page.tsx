
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Users, ShoppingBag, Utensils, Bell, LogOut, Settings, FileText, QrCode, AlertCircle } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { getTotalUsersCount, getRecentUsers, type User as UserData } from "@/services/userService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = 'force-dynamic'; // Opt into dynamic rendering

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

const mockRecentSales = [
    { id: "S001", user: "Alice Smith", plan: "Full Feast", amount: 90.00, date: "2024-07-20" },
    { id: "S002", user: "David Brown", plan: "Daily Delights", amount: 65.00, date: "2024-07-19" },
    { id: "S003", user: "Eve Davis", plan: "Full Feast", amount: 90.00, date: "2024-07-19" },
];

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsersData() {
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const count = await getTotalUsersCount();
        setTotalUsers(count);
        const users = await getRecentUsers(3); // Fetch 3 recent users for the dashboard
        setRecentUsers(users);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUsersError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoadingUsers(false);
      }
    }
    fetchUsersData();
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
          <Button variant="outline">Generate Report</Button>
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
                  {/* Placeholder for percentage change */}
                  <p className="text-xs text-muted-foreground">Currently active</p> 
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+15.3% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coupons Sold</CardTitle>
              <Utensils className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+10% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Basic, Daily, Full</p>
            </CardContent>
          </Card>
        </div>
        
        {usersError && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading User Data</AlertTitle>
                <AlertDescription>
                    {usersError}
                </AlertDescription>
            </Alert>
        )}

        {/* Sales Chart and Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
              <CardDescription>Monthly sales overview (mock data).</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <RechartsBarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </RechartsBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>New users who joined recently.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : usersError && !recentUsers.length ? (
                 <p className="text-sm text-muted-foreground text-center py-4">Could not load recent users.</p>
              ) : recentUsers.length === 0 && !usersError ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent users found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.currentPlan ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">{user.currentPlan}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Sales */}
        <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>A list of recent meal plan purchases.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.user}</TableCell>
                      <TableCell>{sale.plan}</TableCell>
                      <TableCell className="text-right">${sale.amount.toFixed(2)}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

      </main>
    </div>
  );
}

