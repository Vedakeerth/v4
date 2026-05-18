import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import { verifyRecaptchaEnterprise } from "@/lib/recaptcha";
import { decrypt } from "@/lib/crypto";
import { generateSequentialId } from "@/lib/order-id";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = decrypt(process.env.CASHFREE_SECRET_KEY || "");
const CASHFREE_ENV = process.env.CASHFREE_ENV || "sandbox"; // 'sandbox' or 'production'

const CASHFREE_URL = CASHFREE_ENV === "production" 
  ? "https://api.cashfree.com/pg/orders" 
  : "https://sandbox.cashfree.com/pg/orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customerName, 
      email, 
      phone, 
      address, 
      items, 
      totalAmount, 
      message, 
      recaptchaToken, 
      pdfUrl, 
      megaFolderUrl, 
      trackingId: providedTrackingId,
      shipping,
      discount,
      subtotal,
      roundOff
    } = body;

    if (!customerName || !phone || !address || !items || !totalAmount) {
      return NextResponse.json({ success: false, error: "Missing required fields or reCAPTCHA token" }, { status: 400 });
    }

    const isValidRecaptcha = await verifyRecaptchaEnterprise(recaptchaToken, 'SUBMIT');
    if (!isValidRecaptcha) {
      return NextResponse.json({ success: false, error: "reCAPTCHA verification failed. Please try again." }, { status: 400 });
    }

    const trackingId = providedTrackingId || await generateSequentialId("IN");

    const orderData = {
      trackingId,
      customerName,
      email,
      phone,
      address,
      message: message || "No additional message",
      items,
      totalAmount,
      shipping: Number(shipping) || 0,
      discount: Number(discount) || 0,
      subtotal: Number(subtotal) || 0,
      roundOff: Number(roundOff) || 0,
      pdfUrl: pdfUrl || null,
      megaFolderUrl: megaFolderUrl || null,
      status: "Waiting",
      paymentStatus: "unpaid",
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = adminDb.collection("orders").doc(trackingId);
    await docRef.set(orderData);

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
        order_id: trackingId,
        order_amount: Number(totalAmount).toFixed(2),
        order_currency: "INR",
        customer_details: {
          customer_id: phone.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || "guest", 
          customer_name: customerName,
          customer_email: email || "customer@example.com",
          customer_phone: phone.replace(/\D/g, '').slice(-10),
        },
        order_meta: {
          return_url: `${req.headers.get("origin")}/payment-status?order_id={order_id}`,
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
