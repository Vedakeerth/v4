import { NextResponse } from 'next/server';
import { updateOrder } from '@/lib/orders';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const success = await updateOrder(orderId, { status });

        if (!success) {
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Admin Order Status Update Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
