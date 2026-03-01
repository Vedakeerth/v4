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
        const { catalogUrl, products: importedProducts } = body;

        // If catalogUrl is provided, try to fetch from it
        let productsToImport: any[] = [];
        
        if (catalogUrl) {
            // Check if it's a WhatsApp link
            if (catalogUrl.includes('wa.me') || catalogUrl.includes('whatsapp.com')) {
                // Import WhatsApp product logic inline
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
                    
                    // Helper function to decode HTML entities
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

                    // Extract product information from WhatsApp page
                    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                    let productName = titleMatch ? titleMatch[1] : null;
                    
                    if (productName) {
                        // Decode HTML entities
                        productName = decodeHtml(productName);
                        // Clean up the name
                        productName = productName
                            .replace(/ - WhatsApp$/i, '')
                            .replace(/\s*from\s+.*?\s+on\s+WhatsApp$/i, '')
                            .replace(/\s*on\s+WhatsApp$/i, '')
                            .trim();
                    }
                    
                    if (!productName || productName === 'WhatsApp Main Page' || productName.length < 3) {
                        return NextResponse.json({ 
                            success: false, 
                            message: 'Could not extract product information from WhatsApp page. Please use "Paste JSON" mode to manually add the product with these details:\n\n- Name: Wall & Table Plant Holder\n- Price: ₹105.49\n- Category: Decoration\n- Description: (add your description)\n- Images: (add image URLs)' 
                        }, { status: 400 });
                    }
                    
                    // Try to find product image
                    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                    let image = imageMatch ? imageMatch[1] : '/images/default.png';
                    // Decode HTML entities in image URL
                    image = decodeHtml(image);
                    
                    // Try to extract price - look for various patterns
                    let price = '₹0.00';
                    
                    // 1. Try to find price in meta tags
                    const metaPriceMatch = html.match(/<meta[^>]*(?:property|name)=["'](?:product:price|price)["'][^>]*content=["']([^"']+)["']/i);
                    if (metaPriceMatch && metaPriceMatch[1]) {
                        const metaPrice = metaPriceMatch[1].replace(/[^\d.]/g, '');
                        if (metaPrice) {
                            price = `₹${metaPrice}`;
                        }
                    }
                    
                    // 2. Try to find price in JSON-LD structured data
                    if (price === '₹0.00') {
                        const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
                        if (jsonLdMatches) {
                            for (const jsonLd of jsonLdMatches) {
                                try {
                                    const jsonContent = jsonLd.replace(/<script[^>]*>|<\/script>/gi, '').trim();
                                    const data = JSON.parse(jsonContent);
                                    if (data.price || data.offers?.price || data['@graph']?.find((item: any) => item.price)) {
                                        const foundPrice = data.price || data.offers?.price || data['@graph']?.find((item: any) => item.price)?.price;
                                        if (foundPrice) {
                                            const priceValue = typeof foundPrice === 'string' ? foundPrice.replace(/[^\d.]/g, '') : foundPrice.toString();
                                            if (priceValue) {
                                                price = `₹${priceValue}`;
                                                break;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Continue to next pattern
                                }
                            }
                        }
                    }
                    
                    // 3. Try to find price in various text patterns
                    if (price === '₹0.00') {
                        const pricePatterns = [
                            /₹\s*([\d,]+\.?\d*)/i,
                            /INR\s*([\d,]+\.?\d*)/i,
                            /Rs\.?\s*([\d,]+\.?\d*)/i,
                            /price["']?\s*[:=]\s*["']?₹?\s*([\d,]+\.?\d*)/i,
                            /(\d+\.?\d*)\s*rupees?/i,
                            /<span[^>]*class=["'][^"']*price[^"']*["'][^>]*>.*?₹?\s*([\d,]+\.?\d*)/is,
                            /<div[^>]*class=["'][^"']*price[^"']*["'][^>]*>.*?₹?\s*([\d,]+\.?\d*)/is,
                            /data-price=["']([\d,]+\.?\d*)["']/i,
                            /price["']?\s*:\s*["']?([\d,]+\.?\d*)["']?/i,
                        ];
                        
                        for (const pattern of pricePatterns) {
                            const match = html.match(pattern);
                            if (match && match[1]) {
                                const priceValue = match[1].replace(/,/g, '');
                                if (priceValue && parseFloat(priceValue) > 0) {
                                    price = `₹${priceValue}`;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // 4. Try to extract from WhatsApp-specific patterns (look for price near product name)
                    if (price === '₹0.00') {
                        // Look for price in the same area as the product title
                        const titleSection = html.substring(
                            Math.max(0, html.indexOf(productName) - 500),
                            Math.min(html.length, html.indexOf(productName) + 2000)
                        );
                        
                        const nearbyPriceMatch = titleSection.match(/₹\s*([\d,]+\.?\d*)/i);
                        if (nearbyPriceMatch && nearbyPriceMatch[1]) {
                            const priceValue = nearbyPriceMatch[1].replace(/,/g, '');
                            if (priceValue && parseFloat(priceValue) > 0) {
                                price = `₹${priceValue}`;
                            }
                        }
                    }
                    
                    // Create product
                    const existingProducts = getProducts();
                    const newProduct: Product = {
                        id: getNextId(existingProducts),
                        name: productName,
                        description: `Product imported from WhatsApp catalog`,
                        price: price,
                        image: decodeHtml(image), // Decode image URL
                        images: [decodeHtml(image)], // Decode image URLs
                        category: 'Uncategorized',
                        inStock: true,
                        quantity: 0,
                    };

                    const updatedProducts = [...existingProducts, newProduct];
                    saveProducts(updatedProducts);

                    return NextResponse.json({ 
                        success: true, 
                        message: `Successfully imported product: ${productName}`,
                        imported: 1,
                        products: [newProduct]
                    });
                } catch (error) {
                    console.error('Error importing from WhatsApp:', error);
                    return NextResponse.json({ 
                        success: false, 
                        message: 'Failed to import from WhatsApp. Please use "Paste JSON" mode to manually add products. For your product "Wall & Table Plant Holder", you can add it manually with price ₹105.49.' 
                    }, { status: 400 });
                }
            }

            try {
                // Fetch catalog data from URL
                const response = await fetch(catalogUrl, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch catalog: ${response.statusText}`);
                }

                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    return NextResponse.json({ 
                        success: false, 
                        message: 'The URL does not return JSON data. Please provide a direct link to a JSON file (e.g., https://example.com/catalog.json)' 
                    }, { status: 400 });
                }
                
                const data = await response.json();
                
                // Handle different response formats
                if (Array.isArray(data)) {
                    productsToImport = data;
                } else if (data.products && Array.isArray(data.products)) {
                    productsToImport = data.products;
                } else if (data.items && Array.isArray(data.items)) {
                    productsToImport = data.items;
                } else {
                    return NextResponse.json({ 
                        success: false, 
                        message: 'Invalid catalog format. Expected array of products or object with products/items array.' 
                    }, { status: 400 });
                }
            } catch (error) {
                console.error('Error fetching catalog:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                
                // Check if it's a JSON parsing error
                if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected token')) {
                    return NextResponse.json({ 
                        success: false, 
                        message: 'The URL returned HTML instead of JSON. Please provide a direct link to a JSON file, or export your WhatsApp catalog to JSON format first.' 
                    }, { status: 400 });
                }
                
                return NextResponse.json({ 
                    success: false, 
                    message: `Failed to fetch catalog: ${errorMessage}` 
                }, { status: 400 });
            }
        } else if (importedProducts && Array.isArray(importedProducts)) {
            productsToImport = importedProducts;
        } else {
            return NextResponse.json({ 
                success: false, 
                message: 'Please provide either catalogUrl or products array' 
            }, { status: 400 });
        }

        // Get existing products
        const existingProducts = getProducts();
        let nextId = getNextId(existingProducts);
        const newProducts: Product[] = [];

        // Helper function to decode HTML entities
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

        // Process and import products
        for (const item of productsToImport) {
            // Map catalog format to our product format
            const rawName = item.name || item.title || item.productName || 'Unnamed Product';
            const rawDescription = item.description || item.desc || item.details || '';
            const rawImage = item.image || item.imageUrl || item.photo || item.thumbnail || '/images/default.png';
            
            const newProduct: Product = {
                id: nextId++,
                name: decodeHtml(rawName), // Decode HTML entities
                description: decodeHtml(rawDescription), // Decode HTML entities
                price: item.price 
                    ? (typeof item.price === 'string' ? item.price : `₹${item.price}`)
                    : '₹0.00',
                image: decodeHtml(rawImage), // Decode image URL
                images: item.images 
                    ? (Array.isArray(item.images) ? item.images.map((img: any) => decodeHtml(img)) : [decodeHtml(item.images)])
                    : [decodeHtml(rawImage)],
                category: item.category || item.type || item.group || 'Uncategorized',
                inStock: item.inStock !== undefined ? item.inStock : (item.availability !== 'out_of_stock'),
                quantity: item.quantity !== undefined ? parseInt(item.quantity.toString()) : 0,
            };

            // Ensure price has ₹ symbol
            if (!newProduct.price.startsWith('₹')) {
                newProduct.price = `₹${newProduct.price.replace('₹', '')}`;
            }

            newProducts.push(newProduct);
        }

        // Add new products to existing ones
        const updatedProducts = [...existingProducts, ...newProducts];
        saveProducts(updatedProducts);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully imported ${newProducts.length} product(s)`,
            imported: newProducts.length,
            products: newProducts
        });
    } catch (error) {
        console.error('Error importing products:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to import products: ' + (error instanceof Error ? error.message : 'Unknown error')
        }, { status: 500 });
    }
}
