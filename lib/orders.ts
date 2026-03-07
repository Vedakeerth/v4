import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Order } from '@/types';
export type { Order } from '@/types';

export async function getOrders(): Promise<Order[]> {
    const { adminDb } = await import('./firebaseAdmin');
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
    const { adminDb } = await import('./firebaseAdmin');
    try {
        const { id, ...orderData } = order;
        const docRef = id ? adminDb.collection("orders").doc(id) : adminDb.collection("orders").doc();
        await docRef.set({
            ...orderData,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error saving order to Firestore:", error);
        throw error;
    }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<boolean> {
    const { adminDb } = await import('./firebaseAdmin');
    try {
        await adminDb.collection("orders").doc(id).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating order in Firestore:", error);
        return false;
    }
}
