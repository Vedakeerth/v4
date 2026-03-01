import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/orders";
import { getServerSession } from "next-auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        const success = updateOrder(id, { status });

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
    }
}
