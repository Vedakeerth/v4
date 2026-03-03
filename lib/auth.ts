import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            const email = user.email?.toLowerCase() ?? "";
            // Only allow emails listed in ADMIN_EMAILS
            return adminEmails.includes(email);
        },
        async jwt({ token, user }) {
            if (user?.email) {
                const email = user.email.toLowerCase();
                // First email in the list is SUPER_ADMIN, rest are USER
                token.role = email === adminEmails[0] ? "SUPER_ADMIN" : "USER";
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/secure-management-portal/login",
        error: "/secure-management-portal/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export async function isAuthenticated() {
    const session = await getServerSession(authOptions);
    return !!session;
}

export async function getAuthSession() {
    return await getServerSession(authOptions);
}
