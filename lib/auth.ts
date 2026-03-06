import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./users";

const ADMIN_EMAIL = "vaelinsa@gmail.com";

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
                    } else {
                        console.log(`[Auth] Invalid password for: ${email}`);
                    }
                } else {
                    console.log(`[Auth] User not found or has no password set: ${email}`);
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            const email = user.email?.toLowerCase() ?? "";

            if (account?.provider === "google") {
                // Only the admin email can sign in via Google
                if (email === ADMIN_EMAIL) return true;

                // Check if user is an approved user in Firestore
                const firestoreUser = await getUserByEmail(email);
                return !!firestoreUser;
            }

            if (account?.provider === "credentials") {
                // Credentials login — authorize() already validated
                return true;
            }

            return false;
        },
        async jwt({ token, user, account }) {
            if (user) {
                const email = user.email?.toLowerCase() ?? "";

                if (account?.provider === "google") {
                    token.role = email === ADMIN_EMAIL ? "SUPER_ADMIN" : "USER";
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
