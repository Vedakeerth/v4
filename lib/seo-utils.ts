import Hashids from "hashids";

// Initialize Hashids with a salt for security and a minimum length
const salt = process.env.NEXT_PUBLIC_HASHIDS_SALT || "vaelinsa-press-3d-labs";
const hashids = new Hashids(salt, 8);

/**
 * Generates an SEO-friendly slug from a string.
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces with hyphens
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Encodes a numeric ID into a hashid.
 */
export function encodeNumericId(id: number): string {
    return hashids.encode(id);
}

/**
 * Decodes a hashid into a numeric ID.
 */
export function decodeNumericId(hash: string): number | null {
    const decoded = hashids.decode(hash);
    return decoded.length > 0 ? (decoded[0] as number) : null;
}

/**
 * Since Firestore IDs are alphanumeric strings, we can't directly use Hashids.
 * Instead, we use a simple stable hashing function to get a number from the string ID
 * for the hashid portion, but we might still need the original ID for querying.
 * 
 * ALTERNATIVE: For public pages, we can append the first 8 characters of the doc ID 
 * which behaves like a hashid.
 * 
 * REVISED GOAL: The user wants /{type}/{slug}-{hashid}.
 * We will use the last 8 characters of the document ID as the "hashid" for easy extraction.
 */

export function extractIdFromSlug(slug: string): string | null {
    const parts = slug.split("-");
    if (parts.length < 1) return null;
    return parts[parts.length - 1]; // Return the hash part
}

export function createSeoSlug(title: string, id: string | number): string {
    const slug = generateSlug(title || "");
    const idStr = String(id || "");
    const shortId = idStr.slice(-8); // Use last 8 chars for "hash" look
    return `${slug}-${shortId}`;
}

/**
 * For Private pages, we use a random string entirely.
 */
export function generateRandomId(length: number = 10): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
