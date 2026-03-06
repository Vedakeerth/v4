import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        const body = await req.json();
        const { catalogUrl, products: importedProducts } = body;

        let productsToImport: any[] = [];

        if (catalogUrl) {
            // Check if it's a WhatsApp link
            if (catalogUrl.includes('wa.me') || catalogUrl.includes('whatsapp.com')) {
                try {
                    const response = await fetch(catalogUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch: ${response.statusText}`);
                    }

                    const html = await response.text();

                    const decodeHtml = (html: string): string => {
                        return html
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&#x27;/g, "'")
                            .replace(/&#x2F;/g, '/');
                    };

                    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                    let productName = titleMatch ? titleMatch[1] : null;

                    if (productName) {
                        productName = decodeHtml(productName);
                        productName = productName
                            .replace(/ - WhatsApp$/i, '')
                            .replace(/\s*from\s+.*?\s+on\s+WhatsApp$/i, '')
                            .replace(/\s*on\s+WhatsApp$/i, '')
                            .trim();
                    }

                    if (!productName || productName === 'WhatsApp Main Page' || productName.length < 3) {
                        return NextResponse.json({
                            success: false,
                            message: 'Could not extract product information from WhatsApp page.'
                        }, { status: 400 });
                    }

                    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                    let image = imageMatch ? imageMatch[1] : '/images/default.png';
                    image = decodeHtml(image);

                    let price = '₹0.00';
                    const metaPriceMatch = html.match(/<meta[^>]*(?:property|name)=["'](?:product:price|price)["'][^>]*content=["']([^"']+)["']/i);
                    if (metaPriceMatch && metaPriceMatch[1]) {
                        const metaValue = metaPriceMatch[1].replace(/[^\d.]/g, '');
                        if (metaValue) price = `₹${metaValue}`;
                    }

                    const productsRef = adminDb.collection('products');
                    const newDoc = productsRef.doc();
                    const newProduct = {
                        name: productName,
                        description: `Product imported from WhatsApp catalog`,
                        price: price,
                        image: decodeHtml(image),
                        images: [decodeHtml(image)],
                        category: 'Uncategorized',
                        inStock: true,
                        quantity: 0,
                        updatedAt: new Date().toISOString()
                    };

                    await newDoc.set(newProduct);

                    return NextResponse.json({
                        success: true,
                        message: `Successfully imported product: ${productName}`,
                        imported: 1,
                        products: [{ id: newDoc.id, ...newProduct }]
                    });
                } catch (error) {
                    console.error('Error importing from WhatsApp:', error);
                    return NextResponse.json({
                        success: false,
                        message: 'Failed to import from WhatsApp.'
                    }, { status: 400 });
                }
            }

            try {
                const response = await fetch(catalogUrl);
                if (!response.ok) throw new Error(`Failed to fetch catalog: ${response.statusText}`);
                const data = await response.json();
                productsToImport = Array.isArray(data) ? data : (data.products || data.items || []);
            } catch (error) {
                console.error('Error fetching catalog:', error);
                return NextResponse.json({ success: false, message: 'Failed to fetch catalog JSON' }, { status: 400 });
            }
        } else if (importedProducts && Array.isArray(importedProducts)) {
            productsToImport = importedProducts;
        }

        const decodeHtml = (html: string): string => {
            return html
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .replace(/&#x27;/g, "'")
                .replace(/&#x2F;/g, '/');
        };

        const batch = adminDb.batch();
        const productsRef = adminDb.collection('products');
        const newProducts: any[] = [];

        for (const item of productsToImport) {
            const rawName = item.name || item.title || item.productName || 'Unnamed Product';
            const rawDescription = item.description || item.desc || item.details || '';
            const rawImage = item.image || item.imageUrl || item.photo || item.thumbnail || '/images/default.png';

            const newDoc = productsRef.doc();
            const productData = {
                name: decodeHtml(rawName),
                description: decodeHtml(rawDescription),
                price: item.price ? (typeof item.price === 'string' ? item.price : `₹${item.price}`) : '₹0.00',
                image: decodeHtml(rawImage),
                images: item.images ? (Array.isArray(item.images) ? item.images.map((img: any) => decodeHtml(img)) : [decodeHtml(item.images)]) : [decodeHtml(rawImage)],
                category: item.category || item.type || item.group || 'Uncategorized',
                inStock: item.inStock !== undefined ? item.inStock : (item.availability !== 'out_of_stock'),
                quantity: item.quantity !== undefined ? parseInt(item.quantity.toString()) : 0,
                updatedAt: new Date().toISOString()
            };

            if (!productData.price.startsWith('₹')) {
                productData.price = `₹${productData.price.replace('₹', '')}`;
            }

            batch.set(newDoc, productData);
            newProducts.push({ id: newDoc.id, ...productData });
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${newProducts.length} product(s)`,
            imported: newProducts.length,
            products: newProducts
        });
    } catch (error) {
        console.error('Error importing products:', error);
        return NextResponse.json({ success: false, message: 'Failed to import products' }, { status: 500 });
    }
}
