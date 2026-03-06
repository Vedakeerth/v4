import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const docRef = adminDb.collection('coupons').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date().toISOString()
        };
        delete updateData.id;

        if (updateData.code) updateData.code = updateData.code.toUpperCase();
        if (updateData.value) updateData.value = Number(updateData.value);

        await docRef.set(updateData, { merge: true });

        return NextResponse.json({
            success: true,
            coupon: { id, ...doc.data(), ...updateData }
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const docRef = adminDb.collection('coupons').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
        }

        await docRef.delete();

        return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
