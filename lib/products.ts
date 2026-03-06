import { adminDb } from './firebaseAdmin';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    images: string[];
    category: string;
    inStock: boolean;
    stockCount?: number;
    availabilityStatus?: "In Stock" | "Out of Stock" | "Pre-order";
    isPopular?: boolean;
    quantity?: number; // Used for cart
    colors?: string[]; // Hex codes or names
    likes?: number;
}

export async function getProducts(): Promise<Product[]> {
    if (typeof window === 'undefined') {
        try {
            const snapshot = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product));
        } catch (error) {
            console.error('Error fetching products from Firestore:', error);
            return [];
        }
    } else {
        const res = await fetch('/api/products');
        const data = await res.json();
        return data.products || [];
    }
}

export async function getProductById(id: string): Promise<Product | undefined> {
    if (typeof window === 'undefined') {
        const doc = await adminDb.collection('products').doc(id).get();
        if (!doc.exists) return undefined;
        return { id: doc.id, ...doc.data() } as Product;
    } else {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        return data.product;
    }
}
