import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    icon?: string;
    createdAt?: string;
}

export async function GET() {
    try {
        const snapshot = await adminDb.collection('socials').orderBy('createdAt', 'asc').get();
        const socials = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json({ success: true, socials });
    } catch (error) {
        console.error('Error fetching socials:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch socials' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const socials: SocialLink[] = await req.json();

        // Batch update to ensure all links are saved
        const batch = adminDb.batch();
        const collectionRef = adminDb.collection('socials');

        // Simple approach for socials: delete all and re-add or just update by platform
        // For simplicity in a small list, we can just set them
        for (const link of socials) {
            const docRef = link.id ? collectionRef.doc(link.id) : collectionRef.doc();
            batch.set(docRef, {
                ...link,
                createdAt: link.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }

        await batch.commit();

        return NextResponse.json({ success: true, message: 'Social links updated successfully' });
    } catch (error) {
        console.error('Error updating socials:', error);
        return NextResponse.json({ success: false, message: 'Failed to update socials' }, { status: 500 });
    }
}
