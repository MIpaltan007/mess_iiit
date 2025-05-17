
'use server';

import { Timestamp, doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore'; // Added setDoc
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

  const couponRef = doc(db, 'coupons', couponCode); 

  try {
    const docSnap = await getDoc(couponRef);

    if (!docSnap.exists()) {
      return {
        couponId: couponCode, 
        isValid: false,
        message: 'Coupon code is invalid or does not exist.',
      };
    }

    const couponData = { id: docSnap.id, ...docSnap.data() } as CouponData;

    if (!couponData.isValid) {
      const usedAtDate = couponData.usedAt ? couponData.usedAt.toDate().toLocaleString() : 'an unknown date';
      return {
        couponId: couponData.id, 
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

    await updateDoc(couponRef, {
      isValid: false,
      usedAt: serverTimestamp(), 
    });

    const updatedDocSnap = await getDoc(couponRef);
    const updatedCouponData = { id: updatedDocSnap.id, ...updatedDocSnap.data() } as CouponData;
    const finalUsedAt = updatedCouponData.usedAt ? updatedCouponData.usedAt.toDate().toLocaleString() : new Date().toLocaleString();


    return {
      couponId: updatedCouponData.id, 
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
      `Error validating coupon ${couponCode}:`, 
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    return {
      couponId: couponCode, 
      isValid: false,
      message: 'An error occurred while validating the coupon. Please try again.',
    };
  }
}


/**
 * Creates a new coupon document in Firestore after a successful order.
 * The document ID will be the orderId.
 * @param orderId The ID of the order for which this coupon is being created.
 * @param userId The Firebase UID of the user who placed the order.
 * @returns Promise<void>
 */
export async function createCouponForOrder(orderId: string, userId: string): Promise<void> {
  if (!orderId || !userId) {
    console.error("Order ID and User ID are required to create a coupon.");
    // Optionally throw an error or return a specific result
    throw new Error("Missing orderId or userId for coupon creation.");
  }

  const couponRef = doc(db, 'coupons', orderId); // Use orderId as document ID
  const newCouponData = {
    userId: userId, // User's actual Firebase UID
    isValid: true,
    createdAt: serverTimestamp(),
    // You can add more fields here if needed, e.g., a description
    // description: `Coupon for order ${orderId}` 
  };

  try {
    await setDoc(couponRef, newCouponData);
    console.log(`Coupon created successfully for order ${orderId}, user ${userId}`);
  } catch (error: any) {
    console.error(
      `Error creating coupon for order ${orderId}:`,
      error.message,
      error.code ? `(Code: ${error.code})` : '',
      error.stack ? `\nStack: ${error.stack}` : ''
    );
    // Depending on requirements, you might want to re-throw the error
    // or handle it (e.g., log to a monitoring service).
    // For now, we just log it. The order process itself would have succeeded.
    throw new Error(`Failed to create coupon for order ${orderId}.`);
  }
}
