import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

// GET single blog
export async function GET(
    req: Request,
    { params }: any
) {
    try {
        const { id } = await params;
        const doc = await adminDb.collection('blogs').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, blog: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch blog' }, { status: 500 });
    }
}

// PUT - Update blog (requires auth)
export async function PUT(req: Request, { params }: any) {
    try {
        const { id } = await params;
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const docRef = adminDb.collection('blogs').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date().toISOString(),
        };
        delete updateData.id;

        await docRef.set(updateData, { merge: true });

        return NextResponse.json({
            success: true,
            blog: { id, ...doc.data(), ...updateData }
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to update blog' }, { status: 500 });
    }
}

// DELETE - Delete blog (requires auth)
export async function DELETE(req: Request, { params }: any) {
    try {
        const { id } = await params;
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const docRef = adminDb.collection('blogs').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        const blogData = doc.data();

        // Extract and delete images from R2
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
            
            if (blogData.image) {
                const key = extractR2Key(blogData.image);
                if (key) keysToDelete.push(key);
            }
            
            // Delete all collected keys
            for (const key of keysToDelete) {
                await deleteFileFromR2(key).catch(e => console.error("Failed to delete R2 file:", key, e));
            }
        } catch (e) {
            console.error("Error cleaning up R2 files:", e);
        }

        await docRef.delete();
        return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete blog' }, { status: 500 });
    }
}
