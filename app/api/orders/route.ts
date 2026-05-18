import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { isAuthenticated } from "@/lib/auth";

import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

export async function GET() {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const adminDb = await getAdminDb();
        const snapshot = await adminDb.collection('orders').orderBy('createdAt', 'desc').get();
        const orders = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
    }
}
