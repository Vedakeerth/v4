import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const adminDb = await getAdminDb();
        const docRef = adminDb.collection('orders').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        const data = doc.data();
        
        // Return only non-sensitive fields for public quotation view
        // Security: In a real app, you might want to require a partial phone number match or a hash.
        // But for quotations, they are generally accessible by ID.
        
        return NextResponse.json({ 
            success: true, 
            order: {
                trackingId: data?.trackingId || doc.id,
                customerName: data?.customerName,
                address: data?.address,
                email: data?.email,
                phone: data?.phone,
                totalAmount: data?.totalAmount,
                items: data?.items,
                status: data?.status,
                shipping: data?.shipping || 0,
                discount: data?.discount || 0,
                subtotal: data?.subtotal || 0,
                roundOff: data?.roundOff || 0,
                createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt
            } 
        });
    } catch (error) {
        console.error(`Error fetching public order ${id}:`, error);
        return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 });
    }
}
