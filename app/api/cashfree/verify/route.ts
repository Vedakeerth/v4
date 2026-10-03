import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Transaction } from "firebase-admin/firestore";
import { decrypt } from "@/lib/crypto";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = decrypt(process.env.CASHFREE_SECRET_KEY || "");
const CASHFREE_ENV = process.env.CASHFREE_ENV === "production" || process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? "production" : "sandbox";

const CASHFREE_URL = CASHFREE_ENV === "production" 
  ? "https://api.cashfree.com/pg/orders" 
  : "https://sandbox.cashfree.com/pg/orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    // --- CASHFREE STATUS CHECK ---
    const cashfreeResponse = await fetch(`${CASHFREE_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": CASHFREE_APP_ID!,
        "x-client-secret": CASHFREE_SECRET_KEY!,
        "x-api-version": "2023-08-01",
      },
    });

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: cashfreeData.message || "Failed to verify with Cashfree" 
      }, { status: 400 });
    }

    const paymentStatus = cashfreeData.order_status; // PAID, ACTIVE, EXPIRED, USER_DROPPED

    // --- UPDATE FIRESTORE SAFELY ---
    const orderRef = adminDb.collection("orders").doc(orderId);
    
    await adminDb.runTransaction(async (transaction: Transaction) => {
        const orderDoc = (await transaction.get(orderRef)) as any;
        if (!orderDoc.exists) return;

        const currentData = orderDoc.data();
        
        // If already paid, do nothing
        if (currentData?.paymentStatus === "paid" || currentData?.payment?.status === "SUCCESS") {
            return;
        }

        const paymentData = {
            provider: "cashfree",
            cashfreeOrderId: orderId,
            cashfreePaymentId: cashfreeData.cf_order_id || null,
            status: paymentStatus === "PAID" ? "SUCCESS" : paymentStatus === "USER_DROPPED" ? "USER_DROPPED" : paymentStatus === "ACTIVE" ? "PENDING" : "FAILED",
            amount: cashfreeData.order_amount || 0,
            updatedAt: new Date().toISOString()
        };

        if (paymentStatus === "PAID") {
            transaction.update(orderRef, {
                paymentStatus: "paid",
                status: "CONFIRMED",
                paymentId: cashfreeData.cf_order_id || null,
                paidAt: new Date().toISOString(),
                payment: paymentData
            });
        } else if (paymentStatus === "USER_DROPPED") {
            transaction.update(orderRef, { payment: paymentData });
        } else if (paymentStatus === "ACTIVE") {
            transaction.update(orderRef, { payment: paymentData });
        } else {
            transaction.update(orderRef, { payment: paymentData });
        }
    });

    // If Paid, send email asynchronously
    if (paymentStatus === "PAID") {
        try {
            const orderSnap = await orderRef.get();
            if (orderSnap.exists) {
                const { sendOrderConfirmation } = await import("@/lib/emailService");
                await sendOrderConfirmation({
                    id: orderId,
                    ...orderSnap.data()
                });
            }
        } catch (emailError) {
            console.error("Failed to send verification confirmation email:", emailError);
        }
    }

    return NextResponse.json({ 
        success: true, 
        status: paymentStatus,
        paymentId: cashfreeData.cf_order_id,
        message: `Order status is ${paymentStatus}` 
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
