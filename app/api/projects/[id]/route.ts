import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: any
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        await adminDb.collection('projects').doc(id).set({
            ...body,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        const doc = await adminDb.collection('projects').doc(id).get();

        return NextResponse.json({ success: true, project: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ success: false, message: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: any
) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const docRef = adminDb.collection('projects').doc(id);
        const doc = await docRef.get();

        if (doc.exists) {
            const projectData = doc.data() as any;
            try {
                const { deleteFileFromR2 } = await import('@/lib/r2');
                const extractR2Key = (url: string) => {
                    if (!url || !url.includes('/api/r2-file?key=')) return null;
                    try {
                        const keyParam = url.split('key=')[1]?.split('&')[0];
                        return keyParam ? decodeURIComponent(keyParam) : null;
                    } catch { return null; }
                };

                const keysToDelete: string[] = [];
                if (projectData.image) {
                    const key = extractR2Key(projectData.image);
                    if (key) keysToDelete.push(key);
                }
                if (projectData.images && Array.isArray(projectData.images)) {
                    for (const imgUrl of projectData.images) {
                        const key = extractR2Key(imgUrl);
                        if (key) keysToDelete.push(key);
                    }
                }
                
                for (const key of keysToDelete) {
                    await deleteFileFromR2(key).catch(e => console.error("Failed to delete R2 file:", key, e));
                }
            } catch (e) {
                console.error("Error cleaning up R2 files:", e);
            }
        }

        await docRef.delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ success: false, message: "Failed to delete project" }, { status: 500 });
    }
}
