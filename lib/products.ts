import productsData from '../data/products.json';

export interface Product {
    id: number;
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

export function getProducts(): Product[] {
    return productsData as Product[];
}

export async function saveProducts(products: Product[]): Promise<void> {
    if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

        const dir = path.dirname(productsFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    }
}

export function getNextId(products: Product[]): number {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}
