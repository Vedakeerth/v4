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

            // Extract product name
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const rawName = titleMatch ? titleMatch[1].replace(/ - WhatsApp$/, '').trim() : 'Product from WhatsApp';

            // Try to find product description
            const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
            const description = descriptionMatch ? descriptionMatch[1] : '';

            // Try to find product image
            const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                html.match(/<img[^>]*class=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["']/i);
            const image = imageMatch ? imageMatch[1] : '/images/default.png';

            // Extract price
            const priceMatch = html.match(/"price":\s*"([^"]+)"/i) ||
                html.match(/₹\s*([\d,]+\.?\d*)/i) ||
                html.match(/INR\s*([\d,]+\.?\d*)/i);
            const price = priceMatch ? `₹${priceMatch[1].replace(/,/g, '')}` : '₹0.00';

            if (rawName && rawName !== 'WhatsApp Main Page') {
                const productsRef = adminDb.collection('products');
                const newDoc = productsRef.doc();
                const newProduct = {
                    name: rawName,
                    description: description || `Product imported from WhatsApp catalog`,
                    price: price,
                    image: image,
                    images: [image],
                    category: 'Uncategorized',
                    inStock: true,
                    quantity: 0,
                    stockCount: 0,
                    availabilityStatus: "In Stock",
                    updatedAt: new Date().toISOString()
                };

                await newDoc.set(newProduct);

                return NextResponse.json({
                    success: true,
                    message: `Successfully imported product from WhatsApp`,
                    imported: 1,
                    products: [{ id: newDoc.id, ...newProduct }]
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'Could not extract product information from WhatsApp page.'
                }, { status: 400 });
            }
        } catch (error) {
            console.error('Error importing from WhatsApp:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to import from WhatsApp.'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error importing products:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to import products'
        }, { status: 500 });
    }
}
