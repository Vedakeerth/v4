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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const coupons = await getCoupons();
        const index = coupons.findIndex((c: any) => c.id === id);

        if (index === -1) {
            return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
        }

        coupons[index] = {
            ...coupons[index],
            ...body,
            id // Ensure ID doesn't change
        };

        if (body.code) coupons[index].code = body.code.toUpperCase();
        if (body.value) coupons[index].value = Number(body.value);

        await saveCoupons(coupons);

        return NextResponse.json({ success: true, coupon: coupons[index] });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        let coupons = await getCoupons();

        const initialLength = coupons.length;
        coupons = coupons.filter((c: any) => c.id !== id);

        if (coupons.length === initialLength) {
            return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
        }

        await saveCoupons(coupons);

        return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
