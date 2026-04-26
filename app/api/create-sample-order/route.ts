import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const trackingId = `VQ0426-SAMPLE`; // Fixed ID for easy testing
    
    const orderData = {
      trackingId,
      customerName: "Sample Tester",
      email: "tester@example.com",
      phone: "9876543210",
      address: "123 Test Street, Innovation Hub, Bengaluru, KA - 560001",
      message: "This is a sample order created for tracking verification.",
      items: [
        {
          id: "test-part-1",
          name: "Vaelinsa Engine Bracket",
          quantity: 2,
          material: "PETG - Carbon Fiber",
          color: "Matte Black",
          price: 1250,
          subtotal: 2500
        },
        {
          id: "test-part-2",
          name: "Custom Fluid Reservoir",
          quantity: 1,
          material: "SLA Resin - High Temp",
          color: "Transparent Blue",
          price: 3400,
          subtotal: 3400
        }
      ],
      totalAmount: 5900,
      status: "Processing", // Can be "Waiting", "Processing", "Shipped", "Delivered"
      paymentStatus: "paid",
      createdAt: FieldValue.serverTimestamp(),
      lastUpdate: FieldValue.serverTimestamp(),
      timeline: [
        { status: "Waiting", time: new Date().toISOString(), message: "Order received and awaiting confirmation." },
        { status: "Processing", time: new Date().toISOString(), message: "Technical review complete. Parts are now in production." }
      ]
    };

    // Check if it already exists, if so update it
    const existing = await adminDb.collection("orders").where("trackingId", "==", trackingId).get();
    
    if (!existing.empty) {
      await adminDb.collection("orders").doc(existing.docs[0].id).set(orderData, { merge: true });
      return NextResponse.json({ success: true, message: "Sample order updated", trackingId });
    }

    await adminDb.collection("orders").add(orderData);
    return NextResponse.json({ success: true, message: "Sample order created", trackingId });
  } catch (error: any) {
    console.error("Error creating sample order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
