
'use server';

import { Timestamp, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface CouponData {
  id?: string; // document ID, which IS the couponCode
  userId: string;
  planName?: string; // Or other details about what the coupon is for
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner'; // Example, adjust as needed
  isValid: boolean;
  createdAt: Timestamp; // Firestore Timestamp
  usedAt?: Timestamp; // Firestore Timestamp
  description?: string; 
}

export interface CouponValidationServiceResult {
  couponId: string; // This will be the code as entered, or as found in DB
  isValid: boolean; 
  message: string;
  details?: {
    userId: string;
    planName?: string;
    mealType?: 'Breakfast' | 'Lunch' | 'Dinner';
    usedAt?: string; // Formatted string for display
    description?: string;
  };
}

/**
 * Validates a coupon code against Firestore.
 * If valid and usable, it marks the coupon as used.
 * Uses the exact case of the coupon code entered.
 * @param couponCode The coupon code to validate (case-sensitive).
 * @returns Promise<CouponValidationServiceResult>
 */
export async function validateAndUseCoupon(couponCode: string): Promise<CouponValidationServiceResult> {
  if (!couponCode || typeof couponCode !== 'string' || couponCode.trim() === '') {
    return { couponId: couponCode, isValid: false, message: 'Coupon code cannot be empty.' };
  }

  // Use couponCode directly for case-sensitive validation
  const couponRef = doc(db, 'coupons', couponCode); 

  try {
    const docSnap = await getDoc(couponRef);

    if (!docSnap.exists()) {
      return {
        couponId: couponCode, // Use original couponCode as it was not found
        isValid: false,
        message: 'Coupon code is invalid or does not exist.',
      };
    }

    // docSnap.id is the coupon code as it exists in Firestore (case-sensitive)
    const couponData = { id: docSnap.id, ...docSnap.data() } as CouponData;

    if (!couponData.isValid) {
      const usedAtDate = couponData.usedAt ? couponData.usedAt.toDate().toLocaleString() : 'an unknown date';
      return {
        couponId: couponData.id, // Use ID from DB (which is the case-sensitive coupon code)
        isValid: false,
        message: `Coupon has already been used on ${usedAtDate}.`,
        details: {
          userId: couponData.userId,
          planName: couponData.planName,
          mealType: couponData.mealType,
          usedAt: usedAtDate,
          description: couponData.description,
        },
      };
    }

    // Mark coupon as used
    await updateDoc(couponRef, {
      isValid: false,
      usedAt: serverTimestamp(), 
    });

    // Fetch the updated document to get the server-generated timestamp for `usedAt` for immediate display
    const updatedDocSnap = await getDoc(couponRef);
    const updatedCouponData = { id: updatedDocSnap.id, ...updatedDocSnap.data() } as CouponData;
    const finalUsedAt = updatedCouponData.usedAt ? updatedCouponData.usedAt.toDate().toLocaleString() : new Date().toLocaleString();


    return {
      couponId: updatedCouponData.id, // Use ID from DB
      isValid: true,
      message: 'Coupon is valid and has been successfully redeemed.',
      details: {
        userId: updatedCouponData.userId,
        planName: updatedCouponData.planName,
        mealType: updatedCouponData.mealType,
        description: updatedCouponData.description,
        usedAt: finalUsedAt,
      },
    };
  } catch (error: any) {
    console.error(
      `Error validating coupon ${couponCode}:`, // Log original couponCode
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    return {
      couponId: couponCode, // Use original couponCode in case of error
      isValid: false,
      message: 'An error occurred while validating the coupon. Please try again.',
    };
  }
}
