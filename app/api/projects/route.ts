import { NextResponse } from "next/server";
import { getProjects, addProject } from "@/lib/projects";

export async function GET() {
    const projects = await getProjects();
    return NextResponse.json({ success: true, projects });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const project = await addProject(body);
        return NextResponse.json({ success: true, project });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to create project" }, { status: 500 });
    }
}
