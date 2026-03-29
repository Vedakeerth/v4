import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: any
) {
    const { id } = await params;
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        const { getAdminDb } = await import("@/lib/firebaseAdmin");
        const adminDb = await getAdminDb();
        const docRef = adminDb.collection('orders').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        await docRef.set({
            status,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // Send automated status update email
        try {
            const { sendOrderStatusUpdate } = await import("@/lib/emailService");
            await sendOrderStatusUpdate({ 
                id: docRef.id, 
                ...doc.data() 
            }, status);
        } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: any
) {
    const { id } = await params;
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { getAdminDb } = await import("@/lib/firebaseAdmin");
        const adminDb = await getAdminDb();
        const docRef = adminDb.collection('orders').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        await docRef.delete();

        return NextResponse.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        return NextResponse.json({ success: false, message: "Failed to delete order" }, { status: 500 });
    }
}
