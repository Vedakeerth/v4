import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
    try {
        const doc = await adminDb.collection('config').doc('settings').get();
        if (!doc.exists) {
            return NextResponse.json({ success: true, settings: {} });
        }
        return NextResponse.json({ success: true, settings: doc.data() });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        await adminDb.collection('config').doc('settings').set({
            ...body,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ success: false, message: "Failed to save settings" }, { status: 500 });
    }
}
