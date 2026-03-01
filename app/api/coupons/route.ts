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

async function saveCoupons(coupons: any[]) {
    await fs.writeFile(couponsPath, JSON.stringify(coupons, null, 2));
}

export async function GET() {
    const coupons = await getCoupons();
    return NextResponse.json({ success: true, coupons });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, type, value, expiryDate } = body;

        if (!code || !type || !value || !expiryDate) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const coupons = await getCoupons();
        const newCoupon = {
            id: Date.now().toString(),
            code: code.toUpperCase(),
            type,
            value: Number(value),
            expiryDate,
            isActive: true
        };

        coupons.push(newCoupon);
        await saveCoupons(coupons);

        return NextResponse.json({ success: true, coupon: newCoupon });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
