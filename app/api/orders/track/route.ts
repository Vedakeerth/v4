import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const trackingId = searchParams.get('trackingId');
        const phone = searchParams.get('phone');

        if (!trackingId || !phone) {
            return NextResponse.json({ error: 'Tracking ID and phone number are required' }, { status: 400 });
        }

        // Search for order by trackingId
        const querySnapshot = await adminDb.collection("orders")
            .where("trackingId", "==", trackingId)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const doc = querySnapshot.docs[0];
        const orderData = doc.data();
        
        // Security: Check if phone matches (ends with same 10 digits)
        const isAuthorized = 
            orderData?.phone?.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '').slice(-10));

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized. Phone number does not match.' }, { status: 403 });
        }

        // Calculate estimated delivery (e.g., 7 days after created)
        const createdAt = orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date();
        const estimatedDelivery = new Date(createdAt);
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

        // Return data for public tracking
        return NextResponse.json({
            id: doc.id,
            trackingId: orderData.trackingId,
            status: orderData?.status || "Pending",
            customerName: orderData?.customerName,
            totalAmount: orderData?.totalAmount,
            estimatedDelivery: estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            items: orderData?.items?.map((item: any) => ({
                name: item.name,
                quantity: item.quantity
            })),
        });

    } catch (error) {
        console.error('Order tracking API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
