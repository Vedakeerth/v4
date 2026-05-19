import { NextResponse } from "next/server";

export const revalidate = 0; // Prevent caching to allow instant updates from Admin Dashboard

export async function GET() {
    try {
        const { getAdminDb } = await import("@/lib/firebaseAdmin");
        const db = await getAdminDb();
        
        const snapshot = await db.collection('faqs').orderBy('order', 'asc').get();
        
        const faqs = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return NextResponse.json({ success: true, faqs });
    } catch (error: any) {
        console.error("[FAQS_GET] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
