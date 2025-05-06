'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, CheckCircle, XCircle, Utensils, ArrowLeft, ScanLine } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock coupon data - in a real app, this would come from a database
const mockCoupons: Record<string, { userId: string, planName: string, mealType: 'Breakfast' | 'Lunch' | 'Dinner', isValid: boolean, usedAt?: string }> = {
    "VALID123": { userId: "user1", planName: "Full Feast", mealType: "Lunch", isValid: true },
    "USED456": { userId: "user2", planName: "Daily Delights", mealType: "Dinner", isValid: false, usedAt: "2024-07-20 18:30" },
    "INVALID789": { userId: "user3", planName: "Basic Bites", mealType: "Breakfast", isValid: false }, // e.g., expired or non-existent
};

interface ValidationResult {
    couponId: string;
    isValid: boolean;
    message: string;
    details?: {
        userId: string;
        planName: string;
        mealType: string;
        usedAt?: string;
    };
}

export default function CouponValidationPage() {
    const { toast } = useToast();
    const [couponCode, setCouponCode] = useState('');
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null); // For potential camera access

    const handleValidateCoupon = () => {
        if (!couponCode.trim()) {
            toast({ title: "Error", description: "Please enter a coupon code.", variant: "destructive" });
            setValidationResult(null);
            return;
        }

        const coupon = mockCoupons[couponCode.toUpperCase()];

        if (coupon) {
            if (coupon.isValid) {
                setValidationResult({
                    couponId: couponCode.toUpperCase(),
                    isValid: true,
                    message: "Coupon is valid and can be used.",
                    details: { userId: coupon.userId, planName: coupon.planName, mealType: coupon.mealType }
                });
                // Simulate marking coupon as used
                mockCoupons[couponCode.toUpperCase()].isValid = false;
                mockCoupons[couponCode.toUpperCase()].usedAt = new Date().toLocaleString();
            } else {
                setValidationResult({
                    couponId: couponCode.toUpperCase(),
                    isValid: false,
                    message: `Coupon has already been used on ${coupon.usedAt}.`,
                    details: { userId: coupon.userId, planName: coupon.planName, mealType: coupon.mealType, usedAt: coupon.usedAt }
                });
            }
        } else {
            setValidationResult({
                couponId: couponCode.toUpperCase(),
                isValid: false,
                message: "Coupon code is invalid or does not exist."
            });
        }
        setCouponCode(''); // Clear input after validation
    };

    const startScan = async () => {
        setIsScanning(true);
        setValidationResult(null);
        // Simulate QR scan after a delay and set a mock code
        toast({ title: "Scanner Active", description: "Simulating QR code scan..." });
        setTimeout(() => {
            const mockScannedCode = Object.keys(mockCoupons)[Math.floor(Math.random() * Object.keys(mockCoupons).length)];
            setCouponCode(mockScannedCode);
            setIsScanning(false);
            toast({ title: "Code Scanned", description: `Scanned code: ${mockScannedCode}. Press Validate.` });
        }, 2000);

        // Actual camera access (requires user permission & HTTPS):
        // if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        //     try {
        //         const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        //         if (videoRef.current) {
        //             videoRef.current.srcObject = stream;
        //         }
        //         // Here you would integrate a QR library like jsQR or Zxing
        //     } catch (err) {
        //         console.error("Error accessing camera: ", err);
        //         toast({ title: "Camera Error", description: "Could not access camera.", variant: "destructive" });
        //         setIsScanning(false);
        //     }
        // } else {
        //     toast({ title: "Unsupported", description: "QR scanning not supported on this browser/device.", variant: "destructive" });
        //     setIsScanning(false);
        // }
    };

    const stopScan = () => {
        setIsScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
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
          <p className="text-muted-foreground">Validate meal coupons in real-time.</p>
        </header>

        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScanLine className="h-6 w-6"/> Validate Coupon</CardTitle>
            <CardDescription>Enter coupon code manually or scan QR code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isScanning && (
                <div className="bg-muted p-4 rounded-md text-center">
                    <video ref={videoRef} className="w-full h-auto rounded-md border" autoPlay playsInline muted></video>
                    <p className="text-sm text-muted-foreground mt-2">Align QR code within the frame.</p>
                    <Button onClick={stopScan} variant="outline" className="mt-2">Cancel Scan</Button>
                </div>
            )}
            
            {!isScanning && (
                 <div className="space-y-2">
                    <Label htmlFor="couponCode">Coupon Code</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="couponCode" 
                            placeholder="Enter or scan code" 
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value)}
                            className="flex-grow"
                        />
                        <Button onClick={startScan} variant="outline" aria-label="Scan QR Code">
                            <QrCode className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}

            <Button onClick={handleValidateCoupon} className="w-full" disabled={isScanning}>
              Validate Coupon
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
                      <p><span className="font-semibold">Plan:</span> {validationResult.details.planName}</p>
                      <p><span className="font-semibold">Meal Type:</span> {validationResult.details.mealType}</p>
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
