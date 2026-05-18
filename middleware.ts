import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    // Note: secret should match NEXTAUTH_SECRET in .env
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET || "veda3d_secret_2026_cms_portal_security" 
    });
    
    const { pathname } = req.nextUrl;

    // 1. Explicitly allow NextAuth internal routes
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const isAuth = !!token;
    const isAuthPage = pathname.startsWith("/secure-management-portal/login");
    const isAdminPath = pathname.startsWith("/secure-management-portal/admin");
    const isAdminApi = pathname.startsWith("/api/admin");

    // 2. Redirect authorized users away from login page
    if (isAuthPage) {
        if (isAuth) {
            return NextResponse.redirect(new URL("/secure-management-portal/admin", req.url));
        }
        return NextResponse.next();
    }

    // 3. Protect Admin Paths (both UI and API)
    if ((isAdminPath || isAdminApi) && !isAuth) {
        // Return JSON 401 for API requests to avoid "Unexpected token '<'" errors
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Please sign in to access this resource" }, 
                { status: 401 }
            );
        }
        
        // Redirect UI requests to login
        let from = pathname;
        if (req.nextUrl.search) from += req.nextUrl.search;
        return NextResponse.redirect(
            new URL(`/secure-management-portal/login?from=${encodeURIComponent(from)}`, req.url)
        );
    }

    // 4. Role-based protection for specific Admin routes
    if (isAdminApi && (pathname.startsWith("/api/admin/users") || pathname.includes("users-tab"))) {
        if (token?.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { error: "Forbidden", message: "Super Admin privileges required" }, 
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/secure-management-portal/:path*",
        "/api/admin/:path*",
    ],
};
