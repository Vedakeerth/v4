import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import { verifyRecaptchaEnterprise } from "@/lib/recaptcha";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "sandbox"; // 'sandbox' or 'production'

const CASHFREE_URL = CASHFREE_ENV === "production" 
  ? "https://api.cashfree.com/pg/orders" 
  : "https://sandbox.cashfree.com/pg/orders";

/**
 * Generate a sequential Quotation Number: VQXXXX-XXXX
 * e.g., VQ0426-4102
 * Uses IST (India Standard Time) to ensure the date matches the local user.
 */
async function generateQuotationNo() {
  // Convert to IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getUTCDate()).padStart(2, '0');
  const datePrefix = `${mm}${dd}`;

  try {
    const counterRef = adminDb.collection("counters").doc("quotations");
    
    // Use a transaction to ensure atomic increment and sequential numbering
    const newSerial = await adminDb.runTransaction(async (transaction: any) => {
      const counterDoc = await transaction.get(counterRef);
      
      let nextSerial = 4101; // Start from 4101 as per user's sequence example
      
      if (counterDoc.exists) {
        const data = counterDoc.data();
        const currentSerial = data?.lastSerial || 4100;
        nextSerial = currentSerial + 1;
      }
      
      transaction.set(counterRef, { lastSerial: nextSerial }, { merge: true });
      return nextSerial;
    }) as number;

    return `VQ${datePrefix}-${newSerial}`;
  } catch (error) {
    console.error("Error generating sequential number:", error);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `VQ${datePrefix}-${randomNum}`;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, email, phone, address, items, totalAmount, message, recaptchaToken } = body;

    if (!customerName || !phone || !address || !items || !totalAmount || !recaptchaToken) {
      return NextResponse.json({ success: false, error: "Missing required fields or reCAPTCHA token" }, { status: 400 });
    }

    const isValidRecaptcha = await verifyRecaptchaEnterprise(recaptchaToken, 'SUBMIT');
    if (!isValidRecaptcha) {
      return NextResponse.json({ success: false, error: "reCAPTCHA verification failed. Please try again." }, { status: 400 });
    }

    const trackingId = await generateQuotationNo();

    const orderData = {
      trackingId,
      customerName,
      email,
      phone,
      address,
      message: message || "No additional message",
      items,
      totalAmount,
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
          return_url: `${req.headers.get("origin")}/checkout?order_id={order_id}&tracking_id=${trackingId}`,
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
