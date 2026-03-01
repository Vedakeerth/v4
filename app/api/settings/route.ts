import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings";

export async function GET() {
    const settings = await getSettings();
    return NextResponse.json({ success: true, settings });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await saveSettings(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to save settings" }, { status: 500 });
    }
}
