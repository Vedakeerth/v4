import { NextResponse } from 'next/server';
import { updateOrder } from '@/lib/orders';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId } = body;

        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'sandbox';

        if (!appId || !secretKey) {
            return NextResponse.json({ error: 'Cashfree configuration error' }, { status: 500 });
        }

        const baseUrl = env === 'sandbox'
            ? `https://sandbox.cashfree.com/pg/orders/${orderId}`
            : `https://api.cashfree.com/pg/orders/${orderId}`;

        const response = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to verify order with Cashfree' }, { status: response.status });
        }

        // Check if order status is PAID
        if (data.order_status === 'PAID') {
            const updated = await updateOrder(orderId, { status: 'Processing', notes: `Cashfree Payment ID: ${data.cf_order_id}` });
            return NextResponse.json({ success: true, status: 'PAID' });
        } else {
            return NextResponse.json({ success: false, status: data.order_status });
        }

    } catch (error) {
        console.error('Cashfree Verify Order Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
