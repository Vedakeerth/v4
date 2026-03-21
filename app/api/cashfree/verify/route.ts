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
            console.error('Cashfree verify failed:', data);
            return NextResponse.json({ error: 'Failed to verify order with Cashfree' }, { status: response.status });
        }

        console.log(`Cashfree verify for ${orderId}: status=${data.order_status} cf_id=${data.cf_order_id}`);

        if (data.order_status === 'PAID') {
            // 1. Update Firestore order to Processing
            await updateOrder(orderId, {
                status: 'Processing',
                notes: `Cashfree Payment ID: ${data.cf_order_id}`
            });

            // 2. Fetch order details from Firestore for WhatsApp notification
            try {
                const { getAdminDb } = await import('@/lib/firebaseAdmin');
                const adminDb = await getAdminDb();
                const orderDoc = await adminDb.collection('orders').doc(orderId).get();
                const order = orderDoc.exists ? orderDoc.data() : null;

                if (order) {
                    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '919999999999'; // Your WhatsApp number with country code, no +

                    // Build WhatsApp message
                    const itemsList = (order.items || [])
                        .map((item: any) => `• ${item.name} x${item.quantity} @ ${item.price}`)
                        .join('\n');

                    const message = [
                        `🛒 *NEW ORDER RECEIVED*`,
                        ``,
                        `📦 Order ID: ${orderId}`,
                        `👤 Customer: ${order.customerName}`,
                        `📧 Email: ${order.email}`,
                        `📱 Phone: ${order.phone}`,
                        `📍 Address: ${order.address}`,
                        ``,
                        `*Items:*`,
                        itemsList,
                        ``,
                        `💰 Total: ${order.totalAmount}`,
                        `💳 Payment: Cashfree (${data.cf_order_id})`,
                        ``,
                        `✅ Payment verified & confirmed`
                    ].join('\n');

                    // Log the WhatsApp message to console (always)
                    console.log('\n📱 WhatsApp Order Alert:\n', message);

                    // Send via WhatsApp link (works as a server-side trigger log)
                    // To actually send: integrate with WhatsApp Business API or Twilio
                    const encodedMsg = encodeURIComponent(message);
                    const waLink = `https://wa.me/${adminPhone}?text=${encodedMsg}`;
                    console.log('WhatsApp Link:', waLink);
                }
            } catch (notifyError) {
                // Non-critical — don't fail the verification if notification fails
                console.error('WhatsApp notification error:', notifyError);
            }

            return NextResponse.json({ success: true, status: 'PAID' });
        } else {
            return NextResponse.json({ success: false, status: data.order_status });
        }

    } catch (error) {
        console.error('Cashfree Verify Order Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
