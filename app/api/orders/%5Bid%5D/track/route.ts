import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;
        const { searchParams } = new URL(req.url);
        const contact = searchParams.get('contact'); // Email or Phone

        if (!orderId || !contact) {
            return NextResponse.json({ error: 'Order ID and contact info required' }, { status: 400 });
        }

        const adminDb = await getAdminDb();
        const doc = await adminDb.collection("orders").doc(orderId).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const orderData = doc.data();
        
        // Basic security: Check if email or phone matches
        const isAuthorized = 
            orderData?.email?.toLowerCase() === contact.toLowerCase() || 
            orderData?.phone?.replace(/\D/g, '').endsWith(contact.replace(/\D/g, '').slice(-10));

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized. Contact info does not match.' }, { status: 403 });
        }

        // Return limited data for public tracking
        return NextResponse.json({
            id: doc.id,
            status: orderData?.status || "Pending",
            customerName: orderData?.customerName,
            date: orderData?.date,
            totalAmount: orderData?.totalAmount,
            items: orderData?.items?.map((item: any) => ({
                name: item.name,
                quantity: item.quantity
            })),
            updates: orderData?.updates || [] // Optional timeline updates
        });

    } catch (error) {
        console.error('Order tracking API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
