import { adminDb } from './firebaseAdmin';

export interface Catalog {
    id: string;
    name: string;
    description: string;
    productIds: string[];
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export async function getCatalogs(): Promise<Catalog[]> {
    const snapshot = await adminDb.collection('catalogs').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Catalog[];
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
    const doc = await adminDb.collection('catalogs').doc(id).get();
    if (!doc.exists) return null;
    return {
        id: doc.id,
        ...doc.data()
    } as Catalog;
}

export async function createCatalog(name: string, description: string, productIds: string[] = []): Promise<Catalog> {
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
    const catalogRef = adminDb.collection('catalogs').doc(id);
    const doc = await catalogRef.get();
    if (!doc.exists) return false;
    await catalogRef.delete();
    return true;
}
