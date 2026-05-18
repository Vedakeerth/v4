import { NextResponse } from "next/server";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/categories";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
    const categories = await getCategories();
    return NextResponse.json({ success: true, categories });
}

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        const userRole = (session?.user as any)?.role;
        if (!session || (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const id = await addCategory(data);
        return NextResponse.json({ success: true, id });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getAuthSession();
        const userRole = (session?.user as any)?.role;
        if (!session || (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id, ...updates } = await req.json();
        await updateCategory(id, updates);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getAuthSession();
        const userRole = (session?.user as any)?.role;
        if (!session || (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        await deleteCategory(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
