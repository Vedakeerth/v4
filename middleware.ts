import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/secure-management-portal/login");

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/secure-management-portal/dashboard", req.url));
            }
            return null;
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }
            return NextResponse.redirect(
                new URL(`/secure-management-portal/login?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        // Role-based protection for User Management
        if (req.nextUrl.pathname.startsWith("/api/admin/users") || req.nextUrl.pathname.includes("users-tab")) {
            if (token?.role !== "SUPER_ADMIN") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/secure-management-portal/login",
        }
    }
);

export const config = {
    matcher: [
        "/secure-management-portal/:path*",
        "/api/admin/:path*",
    ],
};
