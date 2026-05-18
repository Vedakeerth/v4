import crypto from 'crypto';

// The key must be 32 characters long for aes-256-cbc
// We use process.env.ENCRYPTION_KEY or a default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'veda-secret-encryption-key-2026-32'; 
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-CBC
 */
export function encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a string using AES-256-CBC
 */
export function decrypt(text: string): string {
    if (!text) return '';
    try {
        // Check if it's actually encrypted (contains :)
        if (!text.includes(':')) return text;

        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("[CRYPTO] Decryption failed:", error);
        return text; // Fallback to original text
    }
}
