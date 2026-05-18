import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { getAuthSession } from '@/lib/auth';

/**
 * GOOGLE DRIVE PERSONAL UPLOAD SYSTEM (OAuth2 via NextAuth)
 * This allows uploading files to the user's personal drive for free.
 */

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate with NextAuth Session
        const session = await getAuthSession();
        const accessToken = (session as any)?.accessToken;

        if (!accessToken) {
            console.error('❌ No Google Access Token found in session');
            return NextResponse.json({ 
                error: "Unauthorized. Please sign in with Google to upload files." 
            }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const quotationID = formData.get("quotationID") as string;

        // 2. Validate input
        if (!file) {
            console.error('❌ Upload attempt failed: No file provided in FormData');
            return NextResponse.json({ error: "File not found. Please ensure the 'file' field is populated." }, { status: 400 });
        }

        if (!quotationID) {
            console.warn('⚠️ No quotationID provided. File will be uploaded to root.');
        }

        console.log(`📂 Processing upload: ${file.name} (${file.type}, ${file.size} bytes) for Quote: ${quotationID || 'N/A'}`);

        // 3. Setup OAuth2 Client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: "v3", auth: oauth2Client });

        /**
         * 4. Folder Logic (Root -> {quotationID})
         * Since this is a personal drive, we create the folder in the user's root.
         */
        let targetFolderId = 'root'; // Default to root

        try {
            if (quotationID) {
                // Check if folder exists in personal drive
                const query = `name='${quotationID}' and 'root' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
                const list = await drive.files.list({
                    q: query,
                    fields: 'files(id)',
                });

                if (list.data.files && list.data.files.length > 0) {
                    targetFolderId = list.data.files[0].id!;
                    console.log(`✅ Using existing folder: ${quotationID} (ID: ${targetFolderId})`);
                } else {
                    // Create it
                    const folder = await drive.files.create({
                        requestBody: {
                            name: quotationID,
                            mimeType: 'application/vnd.google-apps.folder',
                            parents: ['root'],
                        },
                        fields: 'id',
                    });
                    targetFolderId = folder.data.id!;
                    console.log(`📁 Created new folder: ${quotationID} (ID: ${targetFolderId})`);
                }
            }
        } catch (folderError: any) {
            console.error("❌ Folder operation failed:", folderError.message);
            // Fallback to root instead of failing the whole upload
            targetFolderId = 'root';
        }

        // 5. Convert file to Buffer then Stream
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        console.log(`🚀 Uploading to Drive: ${file.name}...`);

        const res = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [targetFolderId!],
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: 'id, name, webViewLink, webContentLink',
        });

        console.log(`✅ Upload successful: ${res.data.id}`);

        return Response.json({ 
            success: true, 
            fileId: res.data.id, 
            webViewLink: res.data.webViewLink,
            name: res.data.name,
            data: {
                files: [{ id: res.data.id, link: res.data.webViewLink }]
            }
        });

    } catch (error: any) {
        console.error("⛔ GOOGLE DRIVE UPLOAD CRITICAL ERROR:", error);
        
        // Handle token expiration or revoked permissions
        if (error.code === 401 || error.message?.includes('invalid_grant')) {
            return NextResponse.json({ 
                error: "Authentication expired. Please sign out and sign in again to refresh your Google session." 
            }, { status: 401 });
        }

        return Response.json({
            error: "Upload failed",
            details: error.message,
        }, { status: 500 });
    }
}
