import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";

export type UserRole = "SUPER_ADMIN" | "USER";

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    createdAt?: string;
}

const USERS_COLLECTION = "users";

export async function getUsers(): Promise<User[]> {
    try {
        const snapshot = await adminDb.collection(USERS_COLLECTION).get();
        return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error("Error reading users from Firestore:", error);
        return [];
    }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    try {
        const snapshot = await adminDb
            .collection(USERS_COLLECTION)
            .where("email", "==", email.trim().toLowerCase())
            .limit(1)
            .get();

        if (snapshot.empty) return undefined;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return undefined;
    }
}

export async function addUser(
    user: Omit<User, "id">
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if user already exists
        const existing = await getUserByEmail(user.email);
        if (existing) {
            return { success: false, error: "User already exists" };
        }

        // Enforce 5 user limit (excluding Super Admin)
        if (user.role === "USER") {
            const allUsers = await getUsers();
            const regularUsers = allUsers.filter((u) => u.role === "USER");
            if (regularUsers.length >= 5) {
                return { success: false, error: "Maximum limit of 5 users reached" };
            }
        }

        await adminDb.collection(USERS_COLLECTION).add({
            ...user,
            email: user.email.trim().toLowerCase(),
            createdAt: new Date().toISOString(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error adding user:", error);
        return { success: false, error: "Failed to add user" };
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {
        const doc = await adminDb.collection(USERS_COLLECTION).doc(id).get();
        if (!doc.exists) return false;

        const userData = doc.data() as User;
        if (userData.role === "SUPER_ADMIN") return false;

        await adminDb.collection(USERS_COLLECTION).doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        return false;
    }
}

export async function updateUser(
    id: string,
    updates: Partial<User>
): Promise<boolean> {
    try {
        const doc = await adminDb.collection(USERS_COLLECTION).doc(id).get();
        if (!doc.exists) return false;

        await adminDb.collection(USERS_COLLECTION).doc(id).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating user:", error);
        return false;
    }
}
