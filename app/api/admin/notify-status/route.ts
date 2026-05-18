import { NextRequest, NextResponse } from "next/server";
import { sendOrderStatusUpdate } from "@/lib/emailService";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, status, shippingPartner, carrierTrackingId } = body;

        if (!orderId || !status) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Get fresh order data from Firebase Admin
        const { getAdminDb } = await import("@/lib/firebaseAdmin");
        const db = await getAdminDb();
        const orderDoc = await db.collection('orders').doc(orderId).get();

        if (!orderDoc.exists) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        const orderData = orderDoc.data();
        
        // Merge with provided tracking info if it's not yet in the doc (though it should be)
        const orderForEmail = {
            ...orderData,
            id: orderId,
            shippingPartner: shippingPartner || orderData?.shippingPartner,
            carrierTrackingId: carrierTrackingId || orderData?.carrierTrackingId
        };

        const result = await sendOrderStatusUpdate(orderForEmail, status);

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error("[ADMIN_NOTIFY] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
