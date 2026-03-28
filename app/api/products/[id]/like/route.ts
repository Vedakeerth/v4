import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
    req: Request,
    { params }: any
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { type } = body; // 'like' or 'unlike'

        const docRef = adminDb.collection('products').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        await docRef.update({
            likes: FieldValue.increment(type === 'like' ? 1 : -1)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error updating likes for product ${id}:`, error);
        return NextResponse.json({ success: false, message: "Failed to update likes" }, { status: 500 });
    }
}
