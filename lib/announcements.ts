import { QueryDocumentSnapshot, DocumentData, Query } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";

export interface Announcement {
    id: string;
    text: string;
    imageUrl?: string;
    link?: string;
    active: boolean;
    order: number;
    createdAt?: string;
}

const COLLECTION = "announcements";

export async function getAnnouncements(onlyActive: boolean = false): Promise<Announcement[]> {
    try {
        let query: Query = adminDb.collection(COLLECTION);
        if (onlyActive) {
            query = query.where("active", "==", true);
        }

        const snapshot = await query.get();
        const docs = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Announcement));

        // Sort in-memory to avoid Firestore composite index requirement
        return docs.sort((a: Announcement, b: Announcement) => (a.order || 0) - (b.order || 0));
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }
}

export async function addAnnouncement(data: Omit<Announcement, "id">): Promise<string> {
    const docRef = await adminDb.collection(COLLECTION).add({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
    await adminDb.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteAnnouncement(id: string): Promise<void> {
    await adminDb.collection(COLLECTION).doc(id).delete();
}
