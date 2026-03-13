import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Catalog } from '@/types';
export type { Catalog } from '@/types';

export async function getCatalogs(): Promise<Catalog[]> {
    if (typeof window === 'undefined') {
        const { getAdminDb } = await import('./firebaseAdmin');
        const adminDb = await getAdminDb();
        const snapshot = await adminDb.collection('catalogs').get();
        return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data()
        })) as Catalog[];
    } else {
        const res = await fetch('/api/catalogs');
        const data = await res.json();
        return data.catalogs || [];
    }
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
    const { getAdminDb } = await import('./firebaseAdmin');
    const adminDb = await getAdminDb();
    const doc = await adminDb.collection('catalogs').doc(id).get();
    if (!doc.exists) return null;
    return {
        id: doc.id,
        ...doc.data()
    } as Catalog;
}

export async function createCatalog(name: string, description: string, productIds: string[] = []): Promise<Catalog> {
    const { getAdminDb } = await import('./firebaseAdmin');
    const adminDb = await getAdminDb();
    const newCatalog: Omit<Catalog, 'id'> = {
        name,
        description,
        productIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
    };
    const docRef = await adminDb.collection('catalogs').add(newCatalog);
    return {
        id: docRef.id,
        ...newCatalog
    };
}

export async function updateCatalog(id: string, updates: Partial<Catalog>): Promise<Catalog | null> {
    const { getAdminDb } = await import('./firebaseAdmin');
    const adminDb = await getAdminDb();
    const catalogRef = adminDb.collection('catalogs').doc(id);
    const doc = await catalogRef.get();
    if (!doc.exists) return null;

    const finalUpdates = {
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    // We don't want to overwrite the ID if it's in the updates
    delete finalUpdates.id;

    await catalogRef.update(finalUpdates);

    const updatedDoc = await catalogRef.get();
    return {
        id: updatedDoc.id,
        ...updatedDoc.data()
    } as Catalog;
}

export async function deleteCatalog(id: string): Promise<boolean> {
    const { getAdminDb } = await import('./firebaseAdmin');
    const adminDb = await getAdminDb();
    const catalogRef = adminDb.collection('catalogs').doc(id);
    const doc = await catalogRef.get();
    if (!doc.exists) return false;
    await catalogRef.delete();
    return true;
}
