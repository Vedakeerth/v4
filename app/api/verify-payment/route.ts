import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "sandbox";

const CASHFREE_URL = CASHFREE_ENV === "production" 
  ? "https://api.cashfree.com/pg/orders" 
  : "https://sandbox.cashfree.com/pg/orders";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

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
      await adminDb.collection("orders").doc(orderId).update({
        paymentStatus: "paid",
        status: "confirmed",
      });

      return NextResponse.json({ 
        success: true, 
        status: "paid",
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
