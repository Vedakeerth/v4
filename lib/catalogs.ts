import catalogsData from '../data/catalogs.json';

export interface Catalog {
    id: string;
    name: string;
    description: string;
    productIds: number[];
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export function getCatalogs(): Catalog[] {
    return (Array.isArray(catalogsData) ? catalogsData : []) as Catalog[];
}

export async function saveCatalogs(catalogs: Catalog[]): Promise<void> {
    if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'data', 'catalogs.json');

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(catalogs, null, 2));
    }
}

export function getCatalogById(id: string): Catalog | null {
    const catalogs = getCatalogs();
    return catalogs.find(c => c.id === id) || null;
}

export async function createCatalog(name: string, description: string, productIds: number[] = []): Promise<Catalog> {
    const catalogs = getCatalogs();
    const newCatalog: Catalog = {
        id: `catalog-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        description,
        productIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
    };
    catalogs.push(newCatalog);
    await saveCatalogs(catalogs);
    return newCatalog;
}

export async function updateCatalog(id: string, updates: Partial<Catalog>): Promise<Catalog | null> {
    const catalogs = getCatalogs();
    const index = catalogs.findIndex(c => c.id === id);
    if (index === -1) return null;

    catalogs[index] = {
        ...catalogs[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };
    await saveCatalogs(catalogs);
    return catalogs[index];
}

export async function deleteCatalog(id: string): Promise<boolean> {
    const catalogs = getCatalogs();
    const filtered = catalogs.filter(c => c.id !== id);
    if (filtered.length === catalogs.length) return false;
    await saveCatalogs(filtered);
    return true;
}
