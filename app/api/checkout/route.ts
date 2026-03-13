import { NextResponse } from 'next/server';
import { addOrder } from '@/lib/orders';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user, items, total, paymentMethod } = body;

        // Generate Order ID
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

        const formattedOrder = {
            id: orderId,
            customerName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            date: new Date().toLocaleDateString('en-GB'),
            totalAmount: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`,
            status: "Pending" as const,
            items: items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                selectedColor: item.selectedColor
            })),
            address: `${user.address}, ${user.city} - ${user.zip}`,
            notes: `Payment: ${paymentMethod?.toUpperCase() || 'N/A'}`
        };

        await addOrder(formattedOrder);

        return NextResponse.json({ success: true, orderId });
    } catch (error) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process order' }, { status: 500 });
    }
}
