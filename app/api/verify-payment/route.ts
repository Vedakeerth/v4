import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { decrypt } from "@/lib/crypto";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = decrypt(process.env.CASHFREE_SECRET_KEY || "");
const CASHFREE_ENV = process.env.CASHFREE_ENV || "sandbox";

const CASHFREE_URL = CASHFREE_ENV === "production" 
  ? "https://api.cashfree.com/pg/orders" 
  : "https://sandbox.cashfree.com/pg/orders";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId"); // Get paymentId from URL if available

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

    // --- UPDATE FIRESTORE IF PAID ---
    if (cashfreeData.order_status === "PAID") {
      const orderRef = adminDb.collection("orders").doc(orderId);
      await orderRef.update({
        paymentStatus: "paid",
        status: "confirmed",
        paymentId: paymentId || cashfreeData.cf_order_id, // Store payment ID
        paidAt: new Date().toISOString(),
      });

      // Send automated confirmation email
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

      return NextResponse.json({ 
        success: true, 
        status: "paid",
        paymentId: paymentId || cashfreeData.cf_order_id,
        message: "Payment verified and order updated" 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        status: cashfreeData.order_status,
        message: `Order status is ${cashfreeData.order_status}` 
      });
    }
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
