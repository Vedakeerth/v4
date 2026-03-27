import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "sandbox"; // 'sandbox' or 'production'

const CASHFREE_URL = CASHFREE_ENV === "production" 
  ? "https://api.cashfree.com/pg/orders" 
  : "https://sandbox.cashfree.com/pg/orders";

/**
 * Generate a random Tracking ID: VK + 6 digits
 */
function generateTrackingId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `VK${randomNum}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, phone, address, items, totalAmount } = body;

    if (!customerName || !phone || !address || !items || !totalAmount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const trackingId = generateTrackingId();

    const orderData = {
      trackingId,
      customerName,
      phone,
      address,
      items,
      totalAmount,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("orders").add(orderData);

    // --- CASHFREE INTEGRATION ---
    const cashfreeResponse = await fetch(CASHFREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID!,
        "x-client-secret": CASHFREE_SECRET_KEY!,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_id: docRef.id,
        order_amount: totalAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: phone, // Using phone as customer_id for simplicity
          customer_name: customerName,
          customer_phone: phone,
        },
        order_meta: {
          return_url: `${req.headers.get("origin")}/track-order?orderId={order_id}`,
        },
      }),
    });

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error("Cashfree Error:", cashfreeData);
      return NextResponse.json({ 
        success: false, 
        error: cashfreeData.message || "Failed to initialize payment" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      orderId: docRef.id, 
      trackingId,
      payment_session_id: cashfreeData.payment_session_id 
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
