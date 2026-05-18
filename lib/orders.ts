import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Order } from '@/types';
export type { Order } from '@/types';

export async function getOrders(): Promise<Order[]> {
    const { getAdminDb } = await import('./firebaseAdmin');
    const adminDb = await getAdminDb();
    try {
        const snapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            ...doc.data(),
            id: doc.id
        })) as Order[];
    } catch (error) {
        console.error("Error reading orders from Firestore:", error);
        return [];
    }
}

export async function addOrder(order: Order): Promise<void> {
    const { getAdminDb } = await import('./firebaseAdmin');
    const adminDb = await getAdminDb();
    try {
        const docRef = order.id ? adminDb.collection("orders").doc(order.id) : adminDb.collection("orders").doc();
        const finalId = order.id || docRef.id;
        await docRef.set({
            ...order,
            id: finalId,
            trackingId: finalId, // Ensure trackingId is also set
            createdAt: order.createdAt || new Date().toISOString()
        });
    } catch (error) {
        console.error("Error saving order to Firestore:", error);
        throw error;
    }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<boolean> {
    const { getAdminDb } = await import('./firebaseAdmin');
    const adminDb = await getAdminDb();
    try {
        await adminDb.collection("orders").doc(id).set(updates, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating order in Firestore:", error);
        return false;
    }
}
