import { NextResponse } from "next/server";
import { getOrders } from "@/lib/orders";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const orders = getOrders();
        return NextResponse.json({ success: true, orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
    }
}
