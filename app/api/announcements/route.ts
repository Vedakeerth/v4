import { NextRequest, NextResponse } from "next/server";
import { getAnnouncements } from "@/lib/announcements";

export async function GET() {
    try {
        const announcements = await getAnnouncements(true); // Only active ones for frontend
        return NextResponse.json(announcements);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}
