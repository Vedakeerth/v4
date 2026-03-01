import { NextResponse } from 'next/server';
import { getProducts, saveProducts, getNextId, Product } from '@/lib/products';
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
        const { whatsappUrl } = body;

        if (!whatsappUrl || !whatsappUrl.includes('wa.me')) {
            return NextResponse.json({
                success: false,
                message: 'Invalid WhatsApp URL'
            }, { status: 400 });
        }

        try {
            // Fetch WhatsApp product page
            const response = await fetch(whatsappUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const html = await response.text();

            // Try to extract product information from WhatsApp page
            // WhatsApp product pages have structured data we can try to parse
            const productsToImport: any[] = [];

            // Extract product name from title or meta tags
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const productName = titleMatch ? titleMatch[1].replace(/ - WhatsApp$/, '').trim() : 'Product from WhatsApp';

            // Try to find product description
            const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
            const description = descriptionMatch ? descriptionMatch[1] : '';

            // Try to find product image
            const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                html.match(/<img[^>]*class=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["']/i);
            const image = imageMatch ? imageMatch[1] : '/images/default.png';

            // Try to extract price (if available in structured data)
            const priceMatch = html.match(/"price":\s*"([^"]+)"/i) ||
                html.match(/₹\s*([\d,]+\.?\d*)/i) ||
                html.match(/INR\s*([\d,]+\.?\d*)/i);
            const price = priceMatch ? `₹${priceMatch[1].replace(/,/g, '')}` : '₹0.00';

            // Create product from extracted data
            if (productName && productName !== 'WhatsApp Main Page') {
                productsToImport.push({
                    name: productName,
                    description: description || `Product imported from WhatsApp catalog`,
                    price: price,
                    image: image,
                    images: [image],
                    category: 'Uncategorized',
                    inStock: true,
                    quantity: 0,
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'Could not extract product information from WhatsApp page. Please use "Paste JSON" mode to manually add products.'
                }, { status: 400 });
            }

            // Get existing products
            const existingProducts = getProducts();
            let nextId = getNextId(existingProducts);
            const newProducts: Product[] = [];

            // Process and import products
            for (const item of productsToImport) {
                const newProduct: Product = {
                    id: nextId++,
                    name: item.name,
                    description: item.description || '',
                    price: item.price.startsWith('₹') ? item.price : `₹${item.price}`,
                    image: item.image || '/images/default.png',
                    images: item.images || [item.image || '/images/default.png'],
                    category: item.category || 'Uncategorized',
                    inStock: item.inStock !== undefined ? item.inStock : true,
                    stockCount: 0,
                    availabilityStatus: item.inStock !== false ? "In Stock" : "Out of Stock",
                    quantity: item.quantity !== undefined ? parseInt(item.quantity.toString()) : 0,
                };


                newProducts.push(newProduct);
            }

            // Add new products to existing ones
            const updatedProducts = [...existingProducts, ...newProducts];
            saveProducts(updatedProducts);

            return NextResponse.json({
                success: true,
                message: `Successfully imported ${newProducts.length} product(s) from WhatsApp`,
                imported: newProducts.length,
                products: newProducts
            });
        } catch (error) {
            console.error('Error importing from WhatsApp:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to import from WhatsApp. WhatsApp product pages may not be accessible programmatically. Please use "Paste JSON" mode to manually add products, or export your catalog to JSON format first.'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error importing products:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to import products: ' + (error instanceof Error ? error.message : 'Unknown error')
        }, { status: 500 });
    }
}
