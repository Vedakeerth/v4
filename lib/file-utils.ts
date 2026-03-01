/**
 * File utility functions for handling file operations in memory
 * No temporary files are created - all operations use ByteIO-like buffers
 */

/**
 * Converts a File object to a Buffer (in-memory, no temp files)
 * Equivalent to Python's BytesIO - all data stays in memory
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Creates a readable stream from a buffer (no file system operations)
 * Stream is created from memory buffer, not from disk
 */
export function bufferToStream(buffer: Buffer): ReadableStream {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(buffer);
            controller.close();
        },
    });
}

/**
 * Validates file size without creating temp files
 */
export function validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Sanitizes filename for safe use
 */
export function sanitizeFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]/g, '_').trim();
}
