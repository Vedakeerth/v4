import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const couponsPath = path.join(process.cwd(), 'data', 'coupons.json');

async function getCoupons() {
    try {
        const data = await fs.readFile(couponsPath, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ success: false, message: "Coupon code is required" }, { status: 400 });
        }

        const coupons = await getCoupons();
        const coupon = coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

        if (!coupon) {
            return NextResponse.json({ success: false, message: "Invalid coupon code" }, { status: 404 });
        }

        const now = new Date();
        const expiry = new Date(coupon.expiryDate);

        if (expiry < now) {
            return NextResponse.json({ success: false, message: "Coupon code has expired" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
