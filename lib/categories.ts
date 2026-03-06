import { adminDb } from "./firebaseAdmin";

export interface Category {
    id: string;
    name: string;
    description?: string;
    order: number;
    createdAt?: string;
}

const COLLECTION = "categories";

export async function getCategories(): Promise<Category[]> {
    try {
        const snapshot = await adminDb.collection(COLLECTION).get();
        const categories = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        } as Category));

        return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function addCategory(data: Omit<Category, "id">): Promise<string> {
    const docRef = await adminDb.collection(COLLECTION).add({
        ...data,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    await adminDb.collection(COLLECTION).doc(id).update(updates);
}

export async function deleteCategory(id: string): Promise<void> {
    await adminDb.collection(COLLECTION).doc(id).delete();
}
