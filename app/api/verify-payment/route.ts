import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, partId, partName, color, quantity } = body;

        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!razorpayKeySecret) {
            return NextResponse.json(
                { success: false, error: 'Payment gateway not configured' },
                { status: 500 }
            );
        }

        // Verify payment signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(text)
            .digest('hex');

        const isSignatureValid = generatedSignature === razorpay_signature;

        if (!isSignatureValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Payment verified successfully
        // Here you can:
        // 1. Save order to database
        // 2. Send confirmation email
        // 3. Update inventory
        // 4. Send WhatsApp notification

        // Example: Send order details via WhatsApp (you can integrate WhatsApp Business API)
        const orderDetails = {
            partId,
            partName,
            color,
            quantity,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            timestamp: new Date().toISOString()
        };

        console.log('Order placed successfully:', orderDetails);

        // TODO: Integrate with your order management system
        // TODO: Send WhatsApp notification to your business number

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            orderDetails
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
