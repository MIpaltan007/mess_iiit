
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById, type OrderData } from '@/services/orderService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Utensils, UserCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamically rendered

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const orderData = await getOrderById(orderId);
          setOrder(orderData);
        } catch (err) {
          console.error("Failed to fetch order:", err);
          setError('Failed to load order details. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg rounded-lg max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3 mt-1" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-1/3 self-end" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
           <div className="mt-4">
            <Link href="/" legacyBehavior>
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Alert className="max-w-lg">
            <Utensils className="h-4 w-4" />
            <AlertTitle>Order Not Found</AlertTitle>
            <AlertDescription>
            The order details could not be found. It might have been moved or the link is incorrect.
            </AlertDescription>
            <div className="mt-4">
                <Link href="/" legacyBehavior>
                <Button variant="outline">Back to Home</Button>
                </Link>
            </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg rounded-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Order Details</CardTitle>
          <CardDescription className="space-y-1">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Placed on:</strong> {new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
            {order.userName && <p className="flex items-center gap-1"><strong>User Name:</strong> <UserCircle className="h-4 w-4 text-muted-foreground"/> {order.userName}</p>}
            <p><strong>User Email:</strong> {order.userEmail}</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-2 text-foreground">Selected Meals:</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.selectedMeals.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell>{meal.name}</TableCell>
                  <TableCell>{meal.mealType}</TableCell>
                  <TableCell className="text-right">₹{meal.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 text-right">
            <p className="text-xl font-semibold text-primary">
              Total Cost: ₹{order.totalCost.toFixed(2)}
            </p>
          </div>
           <div className="mt-8 text-center">
            <Link href="/" legacyBehavior>
                <Button>Back to Home</Button>
            </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
