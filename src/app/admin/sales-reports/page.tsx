
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, CalendarDays, Filter, ArrowLeft, Utensils, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, CartesianGrid, XAxis, YAxis, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { getSalesReports, type SalesReport, type SalesReportChartItem, type DetailedSaleItem } from "@/services/adminDashboardService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialChartConfig = {
  totalSales: {
    label: "Sales (₹)",
    color: "hsl(var(--chart-1))",
  },
  orderCount: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
};

export default function SalesReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29), // Default to last 30 days
    to: new Date(),
  });
  const [reportData, setReportData] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState(initialChartConfig);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      setReportData(null);
      try {
        const data = await getSalesReports(dateRange);
        setReportData(data);
      } catch (err) {
        console.error("Failed to fetch sales reports:", err);
        setError("Failed to load sales reports. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [dateRange]);

  const formatDateForDisplay = (date: Date | undefined) => {
    return date ? format(date, "LLL dd, y") : "Pick a date";
  };

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
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-semibold text-primary">Sales Reports</h2>
          <div className="flex gap-2 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {formatDateForDisplay(dateRange.from)} - {formatDateForDisplay(dateRange.to)}
                      </>
                    ) : (
                      formatDateForDisplay(dateRange.from)
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" disabled>
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button disabled>
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </div>
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sales Performance Overview</CardTitle>
            <CardDescription>Visual representation of sales trends for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[350px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !reportData || reportData.chartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No sales data available for the selected period.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <RechartsLineChart accessibilityLayer data={reportData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                    padding={{ left: 10, right: 10 }}
                    tickMargin={5}
                  />
                  <YAxis yAxisId="left" stroke="var(--color-totalSales)" tickFormatter={(value) => `₹${value}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-orderCount)" />
                  <RechartsTooltip 
                    content={<ChartTooltipContent 
                        formatter={(value, name) => {
                            if (name === "totalSales") return `₹${Number(value).toFixed(2)}`;
                            if (name === "orderCount") return `${Number(value)} orders`;
                            return String(value);
                        }}
                        labelFormatter={(label) => format(new Date(label), "PP")}
                    />} 
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="totalSales" stroke="var(--color-totalSales)" strokeWidth={2} yAxisId="left" dot={false} name="Sales (₹)" />
                  <Line type="monotone" dataKey="orderCount" stroke="var(--color-orderCount)" strokeWidth={2} yAxisId="right" dot={false} name="Orders"/>
                </RechartsLineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Sales Data</CardTitle>
            <CardDescription>A comprehensive list of sales transactions for the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !reportData || reportData.detailedSales.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No detailed sales records available for the selected period.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.detailedSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell className="truncate max-w-[200px]">{sale.user}</TableCell>
                        <TableCell className="text-right">{sale.itemsCount}</TableCell>
                        <TableCell className="text-right">₹{sale.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 pt-4 border-t font-semibold text-right">
                  <p>Total Sales for Period: ₹{reportData.summary.totalSales.toFixed(2)}</p>
                  <p>Total Orders for Period: {reportData.summary.totalOrders}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    