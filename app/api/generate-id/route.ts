import { NextResponse } from "next/server";
import { generateSequentialId } from "@/lib/order-id";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const prefix = searchParams.get('prefix') || 'VQ';
        const nextId = await generateSequentialId(prefix);
        return NextResponse.json({ success: true, trackingId: nextId });
    } catch (error: any) {
        console.error("Failed to generate sequential ID:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
