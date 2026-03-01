import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getUsers, addUser, deleteUser, updateUser } from "@/lib/users";
import bcrypt from "bcryptjs";

export async function GET() {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = getUsers().map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });

    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = addUser({ name, email, password: hashedPassword, role });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const success = deleteUser(id);
    if (success) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: "Could not delete user" }, { status: 400 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getAuthSession();
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const success = updateUser(id, updates);
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
