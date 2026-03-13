import type { QueryDocumentSnapshot, DocumentData, Query } from "firebase-admin/firestore";
import { Announcement } from "@/types";
export type { Announcement } from "@/types";

const COLLECTION = "announcements";

export async function getAnnouncements(onlyActive: boolean = false): Promise<Announcement[]> {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import("./firebaseAdmin");
        const adminDb = await getAdminDb();
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
            console.error("Error fetching announcements from Firestore:", error);
            return [];
        }
    } else {
        const res = await fetch(`/api/announcements?onlyActive=${onlyActive}`);
        const data = await res.json();
        return data.announcements || [];
    }
}

export async function addAnnouncement(data: Omit<Announcement, "id">): Promise<string> {
    const { getAdminDb } = await import("./firebaseAdmin");
    const adminDb = await getAdminDb();
    const docRef = await adminDb.collection(COLLECTION).add({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
    const { getAdminDb } = await import("./firebaseAdmin");
    const adminDb = await getAdminDb();
    await adminDb.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteAnnouncement(id: string): Promise<void> {
    const { getAdminDb } = await import("./firebaseAdmin");
    const adminDb = await getAdminDb();
    await adminDb.collection(COLLECTION).doc(id).delete();
}
