'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, CalendarDays, Filter, ArrowLeft, Utensils } from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, CartesianGrid, XAxis, YAxis, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";


const salesData = [
  { date: "2024-07-01", totalSales: 250.75, couponsSold: 15, plan: "Full Feast" },
  { date: "2024-07-02", totalSales: 180.50, couponsSold: 10, plan: "Daily Delights" },
  { date: "2024-07-03", totalSales: 320.00, couponsSold: 20, plan: "Full Feast" },
  { date: "2024-07-04", totalSales: 95.25, couponsSold: 5, plan: "Basic Bites" },
  { date: "2024-07-05", totalSales: 210.00, couponsSold: 12, plan: "Daily Delights" },
];

const chartConfig = {
  totalSales: {
    label: "Total Sales ($)",
    color: "hsl(var(--chart-1))",
  },
   couponsSold: {
    label: "Coupons Sold",
    color: "hsl(var(--chart-2))",
  },
};


export default function SalesReportsPage() {
  // TODO: Implement date range filtering and report generation logic

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="w-64 bg-card text-card-foreground p-4 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 text-primary">
          <Utensils className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <ArrowLeft className="h-5 w-5" /> Dashboard
            </a>
          </Link>
          <Link href="/admin/sales-reports" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <FileText className="h-5 w-5" /> Sales Reports
            </a>
          </Link>
          {/* Add other admin links here */}
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-semibold text-primary">Sales Reports</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" /> Date Range
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Sales Performance Overview</CardTitle>
            <CardDescription>Visual representation of sales trends over the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[350px]">
             <ChartContainer config={chartConfig} className="h-full w-full">
                <RechartsLineChart accessibilityLayer data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis yAxisId="left" stroke="var(--color-totalSales)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-couponsSold)" />
                  <RechartsTooltip 
                    content={<ChartTooltipContent 
                        formatter={(value, name) => name === "totalSales" ? `$${Number(value).toFixed(2)}` : String(value)}
                    />} 
                    cursor={{ strokeDasharray: '3 3' }}
                    />
                  <Line type="monotone" dataKey="totalSales" stroke="var(--color-totalSales)" strokeWidth={2} yAxisId="left" dot={false} />
                   <Line type="monotone" dataKey="couponsSold" stroke="var(--color-couponsSold)" strokeWidth={2} yAxisId="right" dot={false} />
                </RechartsLineChart>
              </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Sales Data</CardTitle>
            <CardDescription>A comprehensive list of sales transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead className="text-right">Coupons Sold</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.plan}</TableCell>
                    <TableCell className="text-right">{sale.couponsSold}</TableCell>
                    <TableCell className="text-right">${sale.totalSales.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                 <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{salesData.reduce((sum, s) => sum + s.couponsSold, 0)}</TableCell>
                    <TableCell className="text-right">${salesData.reduce((sum, s) => sum + s.totalSales, 0).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
