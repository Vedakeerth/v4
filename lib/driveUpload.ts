import { Readable } from 'stream';

/**
 * Uploads a file directly to Google Drive
 * File → Buffer → Stream → Google Drive
 * NO temporary files, NO intermediate storage, NO unnecessary processing
 *
 * Lives in its own module (not route.ts) so it can be exported for tests
 * without violating Next.js route-file export constraints.
 */
export async function uploadFileToDrive(
    drive: any,
    file: File,
    folderId: string,
    newFileName: string,
    supportsAllDrives: boolean = true
): Promise<string> {
    try {
        // Step 1: Convert File directly to Buffer (in-memory, instant)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Step 2: Create stream directly from buffer (no disk I/O)
        const stream = Readable.from(buffer);

        // Step 3: Upload STRAIGHT to Google Drive
        const uploadedFile = await drive.files.create({
            requestBody: {
                name: newFileName,
                parents: [folderId],
            },
            media: {
                mimeType: file.type || 'application/octet-stream',
                body: stream, // Direct stream upload to Drive
            },
            fields: 'id, name, webViewLink',
            supportsAllDrives: supportsAllDrives,
        });

        console.log(`✅ File uploaded to Drive: ${uploadedFile.data.id}`);

        return uploadedFile.data.id;
    } catch (error: any) {
        console.error('⛔ Error uploading file to Drive:', error);

        // Translate storage quota errors into an actionable message
        const errorMessage = error.message || error.toString() || '';
        if (errorMessage.includes('storage quota') || errorMessage.includes('Service Accounts do not have storage quota')) {
            throw new Error('Service Accounts do not have storage quota. The folder must be inside a Shared Drive. Please create a Shared Drive and add the service account to it.');
        }

        throw error;
    }
}
