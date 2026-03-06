import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

// Maximum file size: 25MB in bytes
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 5;

// Allowed file types - STL files only
const ALLOWED_EXTENSIONS = ['.stl'];
const ALLOWED_MIME_TYPES = [
    'application/octet-stream', // Common MIME type for STL files
    'model/stl',
    'application/sla',
    'application/vnd.ms-pki.stl',
    'application/x-navistyle',
];

/**
 * Validates file extension
 */
function isValidExtension(filename: string): boolean {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Validates MIME type
 */
function isValidMimeType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Sanitizes filename for Google Drive
 */
function sanitizeFilename(filename: string): string {
    // Remove or replace invalid characters
    return filename.replace(/[<>:"/\\|?*]/g, '_').trim();
}

/**
 * Checks if a folder/file is in a Shared Drive
 */
async function isInSharedDrive(drive: any, fileId: string): Promise<boolean> {
    try {
        const file = await drive.files.get({
            fileId: fileId,
            fields: 'driveId',
            supportsAllDrives: true,
        });
        return !!file.data.driveId; // If driveId exists, it's in a Shared Drive
    } catch (error) {
        // If we can't check, assume it might not be in Shared Drive
        return false;
    }
}

/**
 * Gets or creates a folder in Google Drive (supports Shared Drives)
 * Ensures folder is created in Shared Drive, not personal Drive
 */
async function getOrCreateFolder(
    drive: any,
    parentId: string | null,
    folderName: string,
    supportsAllDrives: boolean = true
): Promise<string> {
    try {
        // Escape single quotes in folder name for query
        const escapedFolderName = folderName.replace(/'/g, "\\'");

        // Search for existing folder - MUST search in Shared Drives
        let query = `name='${escapedFolderName}' and trashed=false and mimeType='application/vnd.google-apps.folder'`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        } else {
            // If no parent, search in Shared Drives only (not personal Drive)
            query += ` and 'root' in parents`;
        }

        const listParams: any = {
            q: query,
            fields: 'files(id, name, driveId)',
            spaces: 'drive',
            supportsAllDrives: supportsAllDrives,
            includeItemsFromAllDrives: supportsAllDrives,
            corpora: 'allDrives', // CRITICAL: Include Shared Drives
        };

        // If parentId is provided, check if it's a Shared Drive ID
        if (parentId) {
            const isParentInSharedDrive = await isInSharedDrive(drive, parentId);
            if (isParentInSharedDrive) {
                // Parent is in Shared Drive, use driveId parameter
                const parentFile = await drive.files.get({
                    fileId: parentId,
                    fields: 'driveId',
                    supportsAllDrives: true,
                });
                if (parentFile.data.driveId) {
                    listParams.driveId = parentFile.data.driveId;
                    listParams.corpora = 'drive';
                }
            }
        }

        const response = await drive.files.list(listParams);

        if (response.data.files && response.data.files.length > 0) {
            const folderId = response.data.files[0].id;
            // Verify the folder is in a Shared Drive
            const isFolderInSharedDrive = await isInSharedDrive(drive, folderId);
            if (!isFolderInSharedDrive && !parentId) {
                throw new Error('Folder must be created in a Shared Drive, not personal Drive. Please ensure you are using a Shared Drive.');
            }
            return folderId;
        }

        // Create folder if it doesn't exist - MUST be in Shared Drive
        const folderMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        if (parentId) {
            folderMetadata.parents = [parentId];
            // Check if parent is in Shared Drive
            const isParentInSharedDrive = await isInSharedDrive(drive, parentId);
            if (!isParentInSharedDrive) {
                throw new Error('Parent folder must be in a Shared Drive. Service Accounts cannot upload to personal Drive folders.');
            }
        } else {
            // If no parent, we need to find a Shared Drive to create folder in
            throw new Error('Cannot create folder without a parent. Please provide a folder ID from a Shared Drive.');
        }

        const createParams: any = {
            requestBody: folderMetadata,
            fields: 'id, driveId',
            supportsAllDrives: supportsAllDrives,
        };

        const folder = await drive.files.create(createParams);

        // Verify folder was created in Shared Drive
        if (!folder.data.driveId && !parentId) {
            throw new Error('Folder was created in personal Drive. Service Accounts require Shared Drive. Please use a Shared Drive folder ID.');
        }

        return folder.data.id;
    } catch (error: any) {
        console.error('Error creating/getting folder:', error);
        // Provide more detailed error information
        if (error.message) {
            throw new Error(`Folder operation failed: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Uploads a file directly to Google Drive (supports Shared Drives)
 * Straight upload - File → Buffer → Stream → Google Drive
 * NO temporary files, NO intermediate storage, NO unnecessary processing
 * Exported for testing purposes
 */
export async function uploadFileToDrive(
    drive: any,
    file: File,
    folderId: string,
    newFileName: string,
    supportsAllDrives: boolean = true
): Promise<string> {
    try {
        // CRITICAL: Verify folder is in Shared Drive before uploading
        const folderInfo = await drive.files.get({
            fileId: folderId,
            fields: 'id, driveId, name',
            supportsAllDrives: true,
        });

        const isFolderInSharedDrive = !!folderInfo.data.driveId;

        if (!isFolderInSharedDrive) {
            throw new Error('Cannot upload to personal Drive folder. The folder must be in a Shared Drive. Please ensure the folder ID is from a Shared Drive.');
        }

        // Step 1: Convert File directly to Buffer (in-memory, instant)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Step 2: Create stream directly from buffer (no disk I/O)
        const stream = Readable.from(buffer);

        // Step 3: Upload STRAIGHT to Google Drive Shared Drive
        // No temp files, no intermediate storage, direct upload
        const uploadParams: any = {
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
        };

        // If folder is in Shared Drive, specify driveId for better performance
        if (folderInfo.data.driveId) {
            uploadParams.driveId = folderInfo.data.driveId;
        }

        const uploadedFile = await drive.files.create(uploadParams);

        console.log(`File uploaded successfully to Shared Drive: ${uploadedFile.data.id}`);

        // Buffer automatically garbage collected - no cleanup needed
        return uploadedFile.data.id;
    } catch (error: any) {
        console.error('Error uploading file directly to Drive:', error);

        // Check for storage quota error
        const errorMessage = error.message || error.toString() || '';
        if (errorMessage.includes('storage quota') || errorMessage.includes('Service Accounts do not have storage quota')) {
            throw new Error('Service Accounts do not have storage quota. The folder must be inside a Shared Drive. Please create a Shared Drive and add the service account to it.');
        }

        if (errorMessage.includes('Cannot upload to personal Drive')) {
            throw error; // Re-throw our custom error
        }

        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        // Validate environment variables with detailed error messages
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            console.error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL');
            return NextResponse.json(
                { success: false, error: 'Server configuration error: GOOGLE_SERVICE_ACCOUNT_EMAIL is missing. Please check your .env.local file.' },
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        }

        if (!process.env.GOOGLE_PRIVATE_KEY) {
            console.error('Missing GOOGLE_PRIVATE_KEY');
            return NextResponse.json(
                { success: false, error: 'Server configuration error: GOOGLE_PRIVATE_KEY is missing. Please check your .env.local file.' },
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        }

        // Parse form data
        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (error: any) {
            console.error('Error parsing form data:', error);
            return NextResponse.json(
                { success: false, error: 'Invalid request format' },
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        }

        // Extract user details
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const orderId = formData.get('orderId') as string;
        const message = (formData.get('message') as string) || '';

        // Validate required fields
        if (!fullName || !email || !phone || !orderId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: fullName, email, phone, orderId' },
                { status: 400 }
            );
        }

        // Extract files - handle both indexed and direct file inputs
        const files: File[] = [];

        // Try indexed files first (file0, file1, etc.)
        for (let i = 0; i < MAX_FILES; i++) {
            const file = formData.get(`file${i}`) as File | null;
            if (file && file instanceof File) {
                files.push(file);
            }
        }

        // If no indexed files found, try 'files' array or direct 'file' field
        if (files.length === 0) {
            const filesField = formData.getAll('files');
            if (filesField.length > 0) {
                filesField.forEach((file) => {
                    if (file instanceof File) {
                        files.push(file);
                    }
                });
            } else {
                const singleFile = formData.get('file') as File | null;
                if (singleFile && singleFile instanceof File) {
                    files.push(singleFile);
                }
            }
        }

        // Validate file count
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { success: false, error: `Maximum ${MAX_FILES} files allowed` },
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        }

        // If no files, return success (files are optional)
        if (files.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No files to upload',
                data: {
                    orderId,
                    filesUploaded: 0,
                    folderPath: null,
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }

        // Validate each file
        for (const file of files) {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { success: false, error: `File "${file.name}" exceeds maximum size of 25MB` },
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
            }

            // Check file extension
            if (!isValidExtension(file.name)) {
                return NextResponse.json(
                    { success: false, error: `File "${file.name}" has invalid extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
            }

            // Check MIME type (additional security)
            // STL files often have generic MIME types, so we primarily rely on extension
            if (file.type && !isValidMimeType(file.type)) {
                // If MIME type is provided but not in our list, check if it's an STL file by extension
                const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
                if (ext !== '.stl') {
                    return NextResponse.json(
                        { success: false, error: `File "${file.name}" has invalid MIME type. Only STL files are allowed.` },
                        {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }
                    );
                }
            }
        }

        // Initialize Google Drive API with proper authentication
        let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';

        if (!privateKey) {
            throw new Error('GOOGLE_PRIVATE_KEY environment variable is missing');
        }

        // Handle different private key formats
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        // Remove surrounding quotes if present (but preserve newlines)
        privateKey = privateKey.replace(/^["']|["']$/g, '');

        // Validate private key format
        if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
            throw new Error('Invalid GOOGLE_PRIVATE_KEY format. Private key must include BEGIN/END markers.');
        }

        // Validate service account email format
        const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        if (!serviceAccountEmail || !serviceAccountEmail.includes('@') || !serviceAccountEmail.includes('.iam.gserviceaccount.com')) {
            throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_EMAIL format. Must be a valid service account email.');
        }

        // Create JWT auth with proper error handling
        let auth: any;
        try {
            auth = new google.auth.JWT({
                email: serviceAccountEmail,
                key: privateKey,
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                ],
            });

            // Test authentication by getting access token (lazy load, don't await)
            // The token will be fetched automatically on first API call
        } catch (authError: any) {
            console.error('Authentication setup error:', authError);
            const errorMsg = authError.message || authError.toString() || '';
            throw new Error(`Authentication setup failed: ${errorMsg}\n\nPlease check your service account credentials in .env.local`);
        }

        const drive = google.drive({ version: 'v3', auth });

        // Check if using Shared Drive (supportsAllDrives = true)
        const supportsAllDrives = true;

        // Get root folder ID from environment variable (can be Shared Drive ID or folder ID)
        // If provided, the "Uploads" folder will be created inside this folder
        const rootFolderId = process.env.GOOGLE_ROOT_FOLDER_ID || process.env.GOOGLE_SHARED_DRIVE_ID || null;

        // Debug logging
        console.log('=== GOOGLE DRIVE UPLOAD DEBUG ===');
        console.log('Root Folder ID:', rootFolderId);
        console.log('Supports All Drives:', supportsAllDrives);

        // Create folder structure: /Uploads/Order_<orderId>/<fullName>_<phone>/
        // CRITICAL: Must be in Shared Drive, not personal Drive
        let uploadsFolderId: string;
        try {
            // If no root folder ID is provided, try to list Shared Drives and use the first one
            if (!rootFolderId) {
                console.log('No root folder ID provided, attempting to find Shared Drive...');
                try {
                    // List all Shared Drives the service account has access to
                    const drivesResponse = await drive.drives.list({
                        pageSize: 10,
                        fields: 'drives(id, name)',
                    });

                    console.log('Shared Drives response:', JSON.stringify(drivesResponse.data, null, 2));

                    if (drivesResponse.data.drives && drivesResponse.data.drives.length > 0) {
                        const firstDrive = drivesResponse.data.drives[0];
                        console.log('Found Shared Drive:', firstDrive.name, firstDrive.id);
                        const sharedDriveId: string | null = firstDrive.id ? String(firstDrive.id) : null;

                        if (!sharedDriveId) {
                            throw new Error('Shared Drive ID is required but was not found');
                        }

                        // First, try to find existing "Uploads" folder in Shared Drive
                        const searchQuery = `name='Uploads' and trashed=false and mimeType='application/vnd.google-apps.folder'`;
                        const searchResponse = await drive.files.list({
                            q: searchQuery,
                            fields: 'files(id, name, driveId)',
                            supportsAllDrives: true,
                            includeItemsFromAllDrives: true,
                            corpora: 'drive',
                            driveId: sharedDriveId,
                            spaces: 'drive',
                        });

                        if (searchResponse.data.files && searchResponse.data.files.length > 0) {
                            const foundFolder = searchResponse.data.files[0];
                            const foundFolderId = foundFolder?.id;
                            if (foundFolderId && typeof foundFolderId === 'string') {
                                uploadsFolderId = foundFolderId;
                                console.log('Found existing Uploads folder:', uploadsFolderId);
                            } else {
                                throw new Error('Invalid folder ID returned from search');
                            }
                        } else {
                            // Create Uploads folder directly in Shared Drive root
                            const createParams: any = {
                                requestBody: {
                                    name: 'Uploads',
                                    mimeType: 'application/vnd.google-apps.folder',
                                },
                                fields: 'id, driveId',
                                supportsAllDrives: true,
                                driveId: sharedDriveId,
                            };

                            const uploadsFolder = await drive.files.create(createParams);

                            if (!uploadsFolder.data || !uploadsFolder.data.id) {
                                throw new Error('Failed to create Uploads folder in Shared Drive');
                            }

                            const createdFolderId = uploadsFolder.data.id;
                            if (!createdFolderId || typeof createdFolderId !== 'string') {
                                throw new Error('Invalid folder ID returned from Google Drive');
                            }

                            uploadsFolderId = createdFolderId;
                            console.log('Created Uploads folder in Shared Drive:', uploadsFolderId);
                        }
                    } else {
                        throw new Error('No Shared Drives found. Please:\n1. Go to Google Drive → "Shared drives"\n2. Click "New" to create a Shared Drive\n3. Add service account: drive-upload-service@instant-quotation-website.iam.gserviceaccount.com\n4. Set permission to "Content Manager"\n5. Restart server and try again');
                    }
                } catch (drivesError: any) {
                    console.error('Error accessing Shared Drives:', drivesError);
                    const errorMessage = drivesError.message || drivesError.toString() || '';

                    if (errorMessage.includes('No Shared Drives found')) {
                        throw new Error('No Shared Drives found. Please:\n1. Go to Google Drive → "Shared drives"\n2. Click "New" to create a Shared Drive\n3. Add service account: drive-upload-service@instant-quotation-website.iam.gserviceaccount.com\n4. Set permission to "Content Manager"\n5. Restart server and try again');
                    }

                    throw new Error(`Failed to access Google Drive: ${errorMessage}\n\nPlease ensure:\n1. A Shared Drive exists\n2. The service account has access to it\n3. Google Drive API is enabled in your Google Cloud project\n4. The service account email is: drive-upload-service@instant-quotation-website.iam.gserviceaccount.com`);
                }
            } else {
                // Verify root folder is in Shared Drive
                const rootFolderInfo = await drive.files.get({
                    fileId: rootFolderId,
                    fields: 'id, driveId, name, mimeType',
                    supportsAllDrives: true,
                });

                if (!rootFolderInfo.data.driveId) {
                    throw new Error(`The folder ID "${rootFolderId}" is NOT in a Shared Drive. It appears to be in personal Drive. Service Accounts cannot use personal Drive folders.\n\nPlease:\n1. Create a Shared Drive\n2. Create a folder inside the Shared Drive\n3. Use that folder ID instead\n\nOr remove GOOGLE_ROOT_FOLDER_ID from .env.local to auto-detect Shared Drive.`);
                }

                console.log('Root folder is in Shared Drive:', rootFolderInfo.data.driveId);
                uploadsFolderId = await getOrCreateFolder(drive, rootFolderId, 'Uploads', supportsAllDrives);
            }

            // Verify Uploads folder is in Shared Drive
            const uploadsFolderInfo = await drive.files.get({
                fileId: uploadsFolderId,
                fields: 'driveId',
                supportsAllDrives: true,
            });

            if (!uploadsFolderInfo.data.driveId) {
                throw new Error('Uploads folder was created in personal Drive instead of Shared Drive. This will cause upload failures.');
            }

            console.log('Uploads folder ID (Shared Drive):', uploadsFolderId);
        } catch (error: any) {
            // If Uploads folder creation fails, check if it's the storage quota error
            console.error('Failed to create/find Uploads folder:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            const errorMessage = error.message || error.toString() || '';

            if (errorMessage.includes('storage quota') || errorMessage.includes('Service Accounts do not have storage quota')) {
                throw new Error('Service Accounts do not have storage quota. Please ensure:\n1. The folder ID you provided is inside a Shared Drive (not personal Drive)\n2. Create a Shared Drive and add the service account to it\n3. Use the Shared Drive ID or a folder inside the Shared Drive\n\nSee SHARED_DRIVE_SETUP.md for detailed instructions.');
            }

            if (errorMessage.includes('NOT in a Shared Drive')) {
                throw error; // Re-throw our custom error
            }

            throw new Error(`Failed to access Google Drive: ${errorMessage}\n\nPlease ensure:\n1. The folder is in a Shared Drive (not personal Drive)\n2. The service account has "Content Manager" or "Manager" access\n3. The folder ID is correct\n4. Google Drive API is enabled in your Google Cloud project`);
        }

        const orderFolderName = `Order_${orderId}`;
        const orderFolderId = await getOrCreateFolder(drive, uploadsFolderId, orderFolderName, supportsAllDrives);
        const userFolderName = `${sanitizeFilename(fullName)}_${phone}`;
        const userFolderId = await getOrCreateFolder(drive, orderFolderId, userFolderName, supportsAllDrives);

        // Upload files STRAIGHT to Google Drive
        // File → Buffer → Stream → Google Drive (direct upload, no temp files)
        const uploadedFiles: Array<{ name: string; id: string; size: number }> = [];

        for (const file of files) {
            const sanitizedFullName = sanitizeFilename(fullName);
            const sanitizedOriginalName = sanitizeFilename(file.name);
            const newFileName = `${orderId}_${sanitizedFullName}_${sanitizedOriginalName}`;

            // Direct upload: File → Google Drive (straight, no intermediate steps)
            const fileId = await uploadFileToDrive(drive, file, userFolderId, newFileName, supportsAllDrives);
            uploadedFiles.push({
                name: file.name,
                id: fileId,
                size: file.size,
            });
        }

        // Store metadata (console log for now, can be extended to database)
        const metadata = {
            timestamp: new Date().toISOString(),
            orderId,
            fullName,
            email,
            phone,
            message,
            files: uploadedFiles.map(f => ({
                originalName: f.name,
                driveId: f.id,
                size: f.size,
            })),
            folderPath: `Uploads/${orderFolderName}/${userFolderName}`,
        };

        console.log('=== FILE UPLOAD METADATA ===');
        console.log(JSON.stringify(metadata, null, 2));

        return NextResponse.json({
            success: true,
            message: 'Files uploaded successfully',
            data: {
                orderId,
                filesUploaded: uploadedFiles.length,
                folderPath: metadata.folderPath,
                files: uploadedFiles // Added this to return names and IDs
            },
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // Provide more helpful error messages
        let errorMessage = 'Failed to upload files';

        if (error.message) {
            errorMessage = error.message;
        } else if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        // Check for OAuth/token errors
        if (errorMessage.includes('oauth2') || errorMessage.includes('token') || errorMessage.includes('Failed to access Google Drive: request to')) {
            errorMessage = 'OAuth authentication failed. Please check:\n1. GOOGLE_SERVICE_ACCOUNT_EMAIL is correct\n2. GOOGLE_PRIVATE_KEY is correct and properly formatted\n3. Service account JSON key matches the email\n4. Google Drive API is enabled in Google Cloud Console\n5. Private key includes \\n characters for newlines';
        }
        // Check for common Google API errors
        else if (errorMessage.includes('insufficient authentication scopes')) {
            errorMessage = 'Google Drive API authentication failed. Please check service account permissions.';
        } else if (errorMessage.includes('File not found') || errorMessage.includes('not found')) {
            errorMessage = 'Google Drive folder not found. Please ensure the "Uploads" folder exists and is shared with the service account.';
        } else if (errorMessage.includes('permission denied') || errorMessage.includes('insufficient permissions')) {
            errorMessage = 'Permission denied. Please ensure the service account has Editor access to the "Uploads" folder in Google Drive.';
        } else if (errorMessage.includes('invalid_grant') || errorMessage.includes('unauthorized_client')) {
            errorMessage = 'Service account authentication failed. The private key may be incorrect or the service account email doesn\'t match. Please verify your credentials in .env.local';
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }
}
