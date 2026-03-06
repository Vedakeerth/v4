import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export interface Coupon {
    id: string;
    code: string;
    type: string;
    value: number;
    expiryDate: string;
    isActive: boolean;
    createdAt?: string;
}

export async function GET() {
    try {
        const snapshot = await adminDb.collection('coupons').orderBy('createdAt', 'desc').get();
        const coupons = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ success: true, coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch coupons' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { code, type, value, expiryDate } = body;

        if (!code || !type || !value || !expiryDate) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const newCoupon = {
            code: code.toUpperCase(),
            type,
            value: Number(value),
            expiryDate,
            isActive: true,
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb.collection('coupons').add(newCoupon);

        return NextResponse.json({
            success: true,
            coupon: { id: docRef.id, ...newCoupon }
        });
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
