import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, customerName, email, phone, orderId } = body;

        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'sandbox';

        if (!appId || !secretKey) {
            console.error('Cashfree credentials missing');
            return NextResponse.json({ error: 'Cashfree configuration error' }, { status: 500 });
        }

        const baseUrl = env === 'sandbox'
            ? 'https://sandbox.cashfree.com/pg/orders'
            : 'https://api.cashfree.com/pg/orders';

        // Clean phone number (remove + and spaces)
        const cleanPhone = phone.replace(/[^+0-9]/g, '').replace(/^\+/, '');

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: orderId || `order_${Date.now()}`,
                order_amount: parseFloat(amount),
                order_currency: "INR",
                customer_details: {
                    customer_id: email,
                    customer_name: customerName,
                    customer_email: email,
                    customer_phone: cleanPhone
                },
                order_meta: {
                    return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?order_id={order_id}`
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cashfree API error:', data);
            return NextResponse.json({ error: data.message || 'Failed to create Cashfree order' }, { status: response.status });
        }

        return NextResponse.json({
            payment_session_id: data.payment_session_id,
            order_id: data.order_id
        });

    } catch (error) {
        console.error('Cashfree Create Order Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
