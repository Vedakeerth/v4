import { NextResponse } from 'next/server';
import { getProducts, saveProducts, getNextId, Product } from '@/lib/products';
import { isAuthenticated } from '@/lib/auth';

// GET all products
export async function GET() {
    try {
        const products = getProducts();
        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch products'
        }, { status: 500 });
    }
}

// POST - Add new product (requires auth)
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
        const products = getProducts();

        const newProduct: Product = {
            id: getNextId(products),
            name: body.name,
            description: body.description,
            price: body.price,
            image: body.image,
            images: body.images || [body.image],
            category: body.category,
            inStock: body.inStock !== undefined ? body.inStock : true,
            stockCount: body.stockCount || 0,
            availabilityStatus: body.availabilityStatus || (body.inStock !== false ? "In Stock" : "Out of Stock"),
        };


        products.push(newProduct);
        await saveProducts(products);

        return NextResponse.json({
            success: true,
            product: newProduct,
            message: 'Product added successfully'
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to add product'
        }, { status: 500 });
    }
}
