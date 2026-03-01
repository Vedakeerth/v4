import { NextResponse } from 'next/server';

// Razorpay SDK (you'll need to install: npm install razorpay)
// For now, using fetch API to Razorpay's API

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, currency, partId, partName, color, quantity } = body;

        // Razorpay API credentials from environment variables
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!razorpayKeyId || !razorpayKeySecret) {
            return NextResponse.json(
                { success: false, error: 'Payment gateway not configured' },
                { status: 500 }
            );
        }

        // Create order via Razorpay API
        const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`
            },
            body: JSON.stringify({
                amount: amount, // Amount in paise
                currency: currency,
                receipt: `order_${partId}_${Date.now()}`,
                notes: {
                    partId: partId.toString(),
                    partName: partName,
                    color: color,
                    quantity: quantity.toString()
                }
            })
        });

        const orderData = await orderResponse.json();

        if (orderData.error) {
            return NextResponse.json(
                { success: false, error: orderData.error.description },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            orderId: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency
        });

    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
