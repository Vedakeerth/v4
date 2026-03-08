import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/announcements";

export async function GET() {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const announcements = await getAnnouncements(); // Admin sees all
        return NextResponse.json({ announcements });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const id = await addAnnouncement(body);
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ error: "Failed to add announcement" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;
        await updateAnnouncement(id, updates);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await deleteAnnouncement(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
    }
}
