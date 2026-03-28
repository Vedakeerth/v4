import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./users";
import { getAdminEmails } from "./adminConfig";
import { getAdminAuth } from "./firebaseAdmin";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
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
                } catch (error) {
                    console.error("Credentials authorize error:", error);
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
                        try {
                            const firestoreUser = await getUserByEmail(email);
                            if (firestoreUser) {
                                userRole = firestoreUser.role || "USER";
                            }
                        } catch (firestoreError) {
                            console.error("Firestore lookup error during authorize:", firestoreError);
                            // Fallback to minimal role if DB fails but token is valid
                        }
                    }

                    return {
                        id: decodedToken.uid,
                        name: decodedToken.name || email.split("@")[0],
                        email: email,
                        role: userRole,
                    };
                } catch (error) {
                    console.error("Firebase authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            try {
                const email = user.email?.toLowerCase() ?? "";
                const adminEmails = getAdminEmails();

                if (account?.provider === "google") {
                    if (adminEmails.includes(email)) return true;

                    try {
                        const firestoreUser = await getUserByEmail(email);
                        return !!firestoreUser;
                    } catch (e) {
                        console.error("SignIn firestore error:", e);
                        return false;
                    }
                }

                if (account?.provider === "credentials" || account?.provider === "firebase") {
                    return true;
                }

                return false;
            } catch (error) {
                console.error("NextAuth signIn error:", error);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            try {
                if (user) {
                    const email = user.email?.toLowerCase() ?? "";
                    const adminEmails = getAdminEmails();

                    if (account?.provider === "google") {
                        token.role = adminEmails.includes(email) ? "SUPER_ADMIN" : "USER";

                        try {
                            const firestoreUser = await getUserByEmail(email);
                            if (firestoreUser?.role) {
                                token.role = firestoreUser.role;
                            }
                        } catch (e) {
                            console.error("JWT firestore error:", e);
                        }
                    } else {
                        token.role = (user as any).role || "USER";
                    }
                    token.id = user.id;
                }
                return token;
            } catch (error) {
                console.error("NextAuth jwt error:", error);
                return token;
            }
        },
        async session({ session, token }) {
            try {
                if (session.user) {
                    (session.user as any).role = token.role || "USER";
                    (session.user as any).id = token.id;
                }
                return session;
            } catch (error) {
                console.error("NextAuth session error:", error);
                return session;
            }
        },
    },
    pages: {
        signIn: "/secure-management-portal/login",
        error: "/secure-management-portal/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "temp-secret-for-debug",
    logger: {
        error(code, metadata) {
            console.error("NEXTAUTH_ERROR", code, metadata);
        },
        warn(code) {
            console.warn("NEXTAUTH_WARN", code);
        },
        debug(code, metadata) {
            // Only log debug in dev
            if (process.env.NODE_ENV === "development") {
                console.log("NEXTAUTH_DEBUG", code, metadata);
            }
        },
    },
};

export async function isAuthenticated() {
    const session = await getServerSession(authOptions);
    return !!session;
}

export async function getAuthSession() {
    return await getServerSession(authOptions);
}
