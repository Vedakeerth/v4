import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code || code.length !== 6) {
        return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Upstream API error" }, { status: 502 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch pincode data" }, { status: 500 });
    }
}
