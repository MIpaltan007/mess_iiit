
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, CheckCircle, XCircle, Utensils, ArrowLeft, ScanLine, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { validateAndUseCoupon, type CouponValidationServiceResult } from "@/services/couponService";

// Interface for displaying validation result on the page
interface ValidationResult {
    couponId: string;
    isValid: boolean;
    message: string;
    details?: {
        userId: string;
        planName?: string;
        mealType?: 'Breakfast' | 'Lunch' | 'Dinner';
        usedAt?: string;
        description?: string;
    };
}

export default function CouponValidationPage() {
    const { toast } = useToast();
    const [couponCode, setCouponCode] = useState('');
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) {
            toast({ title: "Error", description: "Please enter a coupon code.", variant: "destructive" });
            setValidationResult(null);
            return;
        }

        setIsLoading(true);
        setValidationResult(null); // Clear previous result

        try {
            const result: CouponValidationServiceResult = await validateAndUseCoupon(couponCode);
            
            // Map service result to page's ValidationResult
            setValidationResult({
                couponId: result.couponId,
                isValid: result.isValid,
                message: result.message,
                details: result.details ? {
                    userId: result.details.userId,
                    planName: result.details.planName,
                    mealType: result.details.mealType,
                    usedAt: result.details.usedAt,
                    description: result.details.description,
                } : undefined,
            });

            if (result.isValid) {
                toast({ title: "Success", description: result.message });
            } else {
                toast({ title: "Validation Failed", description: result.message, variant: "destructive" });
            }

        } catch (error) {
            console.error("Error in handleValidateCoupon:", error);
            toast({ title: "Error", description: "An unexpected error occurred during validation.", variant: "destructive" });
            setValidationResult({
                couponId: couponCode.toUpperCase(),
                isValid: false,
                message: "An unexpected error occurred. Check console for details."
            });
        } finally {
            setIsLoading(false);
            setCouponCode(''); // Clear input after validation attempt
        }
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
          <Link href="/admin/coupon-validation" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <QrCode className="h-5 w-5" /> Coupon Validation
            </a>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header>
          <h2 className="text-3xl font-semibold text-primary">Coupon Validation</h2>
          <p className="text-muted-foreground">Validate meal coupons in real-time by entering the code.</p>
        </header>

        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScanLine className="h-6 w-6"/> Validate Coupon</CardTitle>
            <CardDescription>Enter coupon code manually below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="couponCode">Coupon Code</Label>
                <Input 
                    id="couponCode" 
                    placeholder="Enter coupon code" 
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="flex-grow"
                    disabled={isLoading}
                />
            </div>

            <Button onClick={handleValidateCoupon} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Validating..." : "Validate Coupon"}
            </Button>

            {validationResult && (
              <Card className={`mt-6 ${validationResult.isValid ? 'border-green-500' : 'border-red-500'}`}>
                <CardHeader className={`flex flex-row items-center gap-2 ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.isValid ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <CardTitle className="text-lg">{validationResult.isValid ? 'Coupon Valid' : 'Coupon Invalid'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><span className="font-semibold">Code:</span> {validationResult.couponId}</p>
                  <p>{validationResult.message}</p>
                  {validationResult.details && (
                    <>
                      <p><span className="font-semibold">User ID:</span> {validationResult.details.userId}</p>
                      {validationResult.details.planName && <p><span className="font-semibold">Plan/Details:</span> {validationResult.details.planName}</p>}
                      {validationResult.details.mealType && <p><span className="font-semibold">Meal Type:</span> {validationResult.details.mealType}</p>}
                      {validationResult.details.description && <p><span className="font-semibold">Description:</span> {validationResult.details.description}</p>}
                       {validationResult.details.usedAt && <p><span className="font-semibold">Used At:</span> {validationResult.details.usedAt}</p>}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
