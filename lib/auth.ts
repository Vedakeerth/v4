import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./users";
import { getAdminAuth } from "./firebaseAdmin";

// Admin emails can be a comma-separated list in environment variables
const getAdminEmails = () => {
    const emails = process.env.ADMIN_EMAILS || "vaelinsa@gmail.com";
    return emails.split(",").map(e => e.trim().toLowerCase());
};

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email.trim().toLowerCase();
                const user = await getUserByEmail(email);

                if (user && user.password) {
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (isValid) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    }
                }
                return null;
            },
        }),
        CredentialsProvider({
            id: "firebase",
            name: "Firebase",
            credentials: {
                idToken: { label: "ID Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.idToken) return null;

                try {
                    const adminAuth = await getAdminAuth();
                    const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
                    const email = decodedToken.email?.toLowerCase();

                    if (!email) return null;

                    const adminEmails = getAdminEmails();
                    let userRole = "USER";

                    if (adminEmails.includes(email)) {
                        userRole = "SUPER_ADMIN";
                    } else {
                        const firestoreUser = await getUserByEmail(email);
                        if (!firestoreUser) return null;
                        userRole = firestoreUser.role || "USER";
                    }

                    return {
                        id: decodedToken.uid,
                        name: decodedToken.name || email.split("@")[0],
                        email: email,
                        role: userRole,
                    };
                } catch (error) {
                    console.error("Firebase auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            const email = user.email?.toLowerCase() ?? "";
            const adminEmails = getAdminEmails();

            if (account?.provider === "google") {
                // If it's a primary admin email, allow
                if (adminEmails.includes(email)) return true;

                // Otherwise check if they exist in Firestore
                const firestoreUser = await getUserByEmail(email);
                return !!firestoreUser;
            }

            if (account?.provider === "credentials" || account?.provider === "firebase") {
                return true;
            }

            return false;
        },
        async jwt({ token, user, account }) {
            if (user) {
                const email = user.email?.toLowerCase() ?? "";
                const adminEmails = getAdminEmails();

                if (account?.provider === "google") {
                    // Default role for Google sign-in
                    token.role = adminEmails.includes(email) ? "SUPER_ADMIN" : "USER";

                    // Override with Firestore role if exists
                    const firestoreUser = await getUserByEmail(email);
                    if (firestoreUser?.role) {
                        token.role = firestoreUser.role;
                    }
                } else {
                    token.role = (user as any).role || "USER";
                }
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
