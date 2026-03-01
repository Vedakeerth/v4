import { NextResponse } from "next/server";
import { updateProject, deleteProject } from "@/lib/projects";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ async params
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const project = await updateProject(parseInt(id), body);
        return NextResponse.json({ success: true, project });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ async params
) {
    try {
        const { id } = await params;
        const success = await deleteProject(parseInt(id));
        return NextResponse.json({ success });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to delete project" }, { status: 500 });
    }
}
