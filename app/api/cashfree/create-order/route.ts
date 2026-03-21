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

        if (!amount || !email || !phone || !customerName) {
            return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
        }

        const baseUrl = env === 'sandbox'
            ? 'https://sandbox.cashfree.com/pg/orders'
            : 'https://api.cashfree.com/pg/orders';

        // Clean phone: digits only, no + or spaces, max 10 digits for India
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);

        // Cashfree customer_id: alphanumeric only, no @ or special chars
        const customerId = email.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);

        // Cashfree order_id: alphanumeric, underscore, hyphen only
        const safeOrderId = (orderId || `order_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');

        // Ensure amount is a valid positive number with max 2 decimal places
        const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: safeOrderId,
                order_amount: parsedAmount,
                order_currency: "INR",
                customer_details: {
                    customer_id: customerId,
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
