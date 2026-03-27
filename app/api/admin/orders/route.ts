import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/orders';

export async function GET() {
    try {
        // In a real app, check admin session here
        const orders = await getOrders();
        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Admin Orders Fetch Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}
