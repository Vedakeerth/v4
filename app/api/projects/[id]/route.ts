import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        await adminDb.collection('projects').doc(id).set({
            ...body,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        const doc = await adminDb.collection('projects').doc(id).get();

        return NextResponse.json({ success: true, project: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ success: false, message: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await adminDb.collection('projects').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ success: false, message: "Failed to delete project" }, { status: 500 });
    }
}
