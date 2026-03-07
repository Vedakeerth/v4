import type { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { Category } from "@/types";
export type { Category } from "@/types";

const COLLECTION = "categories";

export async function getCategories(): Promise<Category[]> {
    if (typeof window === 'undefined') {
        const { adminDb } = await import("./firebaseAdmin");
        try {
            const snapshot = await adminDb.collection(COLLECTION).get();
            const categories = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                id: doc.id,
                ...doc.data(),
            } as Category));

            return categories.sort((a: Category, b: Category) => (a.order || 0) - (b.order || 0));
        } catch (error) {
            console.error("Error fetching categories from Firestore:", error);
            return [];
        }
    } else {
        const res = await fetch('/api/categories');
        const data = await res.json();
        return data.categories || [];
    }
}

export async function addCategory(data: Omit<Category, "id">): Promise<string> {
    const { adminDb } = await import("./firebaseAdmin");
    const docRef = await adminDb.collection(COLLECTION).add({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const { adminDb } = await import("./firebaseAdmin");
    await adminDb.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteCategory(id: string): Promise<void> {
    const { adminDb } = await import("./firebaseAdmin");
    await adminDb.collection(COLLECTION).doc(id).delete();
}
