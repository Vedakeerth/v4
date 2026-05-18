import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const adminDb = await getAdminDb();
        const doc = await adminDb.collection('orders').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = doc.data();

        // Return only necessary data for the invoice
        return NextResponse.json({
            success: true,
            order: {
                id: doc.id,
                trackingId: order?.trackingId,
                customerName: order?.customerName,
                email: order?.email,
                phone: order?.phone,
                address: order?.address,
                items: order?.items,
                totalAmount: order?.totalAmount,
                createdAt: order?.createdAt,
                shipping: order?.shipping || 0,
                discount: order?.discount || 0,
                subtotal: order?.subtotal || 0,
                roundOff: order?.roundOff || 0,
                // Add fields expected by QuotationDocument if necessary
                doorNo: order?.doorNo || '',
                street: order?.street || '',
                city: order?.city || '',
                state: order?.state || '',
                pincode: order?.pincode || '',
            }
        });

    } catch (error) {
        console.error('Public order API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
