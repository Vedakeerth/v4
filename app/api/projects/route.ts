import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAuthenticated } from "@/lib/auth";

export interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    category: string;
    tags: string[];
    createdAt?: string;
}

export async function GET() {
    try {
        const snapshot = await adminDb.collection('projects').orderBy('createdAt', 'desc').get();
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ success: true, projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const newProject = {
            ...body,
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb.collection('projects').add(newProject);

        return NextResponse.json({
            success: true,
            project: { id: docRef.id, ...newProject }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ success: false, message: "Failed to create project" }, { status: 500 });
    }
}
