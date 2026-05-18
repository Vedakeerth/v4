import { Storage } from 'megajs';
import { decrypt } from './crypto';

export interface MegaUploadResult {
    name: string;
    size: number;
    url: string;
    folderUrl: string;
}

let storage: any = null;

async function getStorage(): Promise<any> {
    // If storage exists, verify it's still alive
    if (storage) {
        try {
            // Minimal check to see if storage is still alive without full reload
            if (storage.root) {
                console.log(`[MEGA] Existing session is active. Root: ${storage.root.name}`);
                return storage;
            }
        } catch (err: any) {
            console.warn(`[MEGA] Existing session invalid. Re-authenticating...`);
            storage = null;
        }
    }

    const email = process.env.MEGA_EMAIL;
    const password = decrypt(process.env.MEGA_PASSWORD || '');

    if (!email || !password) {
        throw new Error("MEGA credentials missing in environment variables.");
    }

    console.log(`[MEGA] Initiating fresh login for: ${email}`);
    
    try {
        const s = new Storage({
            email,
            password,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                s.close();
                reject(new Error("MEGA login timeout (30s)"));
            }, 30000);
            
            s.on('ready', () => {
                clearTimeout(timeout);
                console.log(`[MEGA] Storage instance ready event received.`);
                resolve(s);
            });
            
            (s as any).on('error', (err: any) => {
                clearTimeout(timeout);
                console.error(`[MEGA] Storage instance error:`, err);
                reject(err);
            });
            
            // Check if already ready
            if ((s as any).ready) {
                clearTimeout(timeout);
                resolve(s);
            }
        });

        console.log(`[MEGA] Login successful. Verifying root...`);
        // Only reload if root is not already populated
        if (!s.root) {
            await s.reload();
        }
        
        if (!s.root) {
            throw new Error("MEGA root storage is not accessible after login.");
        }

        storage = s;
        console.log(`[MEGA] Storage initialized successfully. Root node found.`);
        return storage;
    } catch (err: any) {
        console.error(`[MEGA] Authentication Failed:`, err.message);
        storage = null;
        throw new Error(`MEGA Authentication Failed: ${err.message}`);
    }
}

export async function uploadToMega(
    file: Buffer | Uint8Array,
    fileName: string,
    quotationID: string,
    rootFolderName: string = 'Quotations',
    retryCount: number = 0
): Promise<MegaUploadResult> {
    const MAX_RETRIES = 3; // Reduced to prevent client-side timeouts
    
    try {
        console.log(`[MEGA][${fileName}] --- STARTING UPLOAD ---`);
        console.log(`[MEGA][${fileName}] Target Quote ID: ${quotationID}`);
        console.log(`[MEGA][${fileName}] Attempt: ${retryCount + 1}/${MAX_RETRIES + 1}`);

        const mega = await getStorage();
        const root = mega.root;
        
        const isDir = (child: any) => child.type === 1 || child.directory === true;

        console.log(`[MEGA][${fileName}] Locating root folder: '${rootFolderName}'`);
        
        // Ensure children are loaded
        if (!root.children || root.children.length === 0) {
            console.log(`[MEGA][${fileName}] Root children empty, reloading tree...`);
            await mega.reload();
        }

        let quotationsRoot = root.children?.find((child: any) => 
            child.name?.toUpperCase() === rootFolderName.toUpperCase() && isDir(child)
        );
        
        if (!quotationsRoot) {
            console.log(`[MEGA][${fileName}] Root folder '${rootFolderName}' not found. Attempting to create or reload...`);
            try {
                quotationsRoot = await mega.mkdir(rootFolderName);
                console.log(`[MEGA][${fileName}] Successfully created root folder: ${rootFolderName}`);
            } catch (err: any) {
                console.log(`[MEGA][${fileName}] mkdir '${rootFolderName}' failed. Performing full reload...`);
                await mega.reload();
                quotationsRoot = mega.root.children?.find((child: any) => 
                    child.name?.toUpperCase() === rootFolderName.toUpperCase() && isDir(child)
                );
                if (!quotationsRoot) {
                    throw new Error(`Critical: Failed to resolve root folder '${rootFolderName}'`);
                }
            }
        }

        // Step 2: Navigate to or create the specific quotation folder
        console.log(`[MEGA][${fileName}] Navigating to quotation subfolder: '${quotationID}'`);
        
        // Always reload children for the specific root folder to ensure we see new subfolders
        let folder = quotationsRoot.children?.find((child: any) => child.name === quotationID && isDir(child));
        
        if (!folder) {
            console.log(`[MEGA][${fileName}] Subfolder '${quotationID}' not found. Creating...`);
            try {
                folder = await quotationsRoot.mkdir(quotationID);
                console.log(`[MEGA][${fileName}] Successfully created subfolder: ${quotationID}`);
            } catch (err: any) {
                console.log(`[MEGA][${fileName}] Subfolder mkdir failed, reloading parent...`);
                await mega.reload();
                // Re-find root after reload as objects might have changed
                const refreshedRoot = mega.root.children?.find((child: any) => 
                    child.name?.toUpperCase() === rootFolderName.toUpperCase() && isDir(child)
                );
                if (!refreshedRoot) throw new Error(`Root folder ${rootFolderName} lost after reload.`);
                
                folder = refreshedRoot.children?.find((child: any) => child.name === quotationID && isDir(child));
                if (!folder) {
                    console.log(`[MEGA][${fileName}] Still not found, second attempt to create subfolder...`);
                    folder = await refreshedRoot.mkdir(quotationID);
                }
            }
        }

        if (!folder) {
            throw new Error(`Failed to resolve target folder: ${quotationID}`);
        }

        console.log(`[MEGA][${fileName}] Pausing 2s for session stability...`);
        await new Promise(r => setTimeout(r, 2000));

        console.log(`[MEGA][${fileName}] Initializing direct buffer upload (${file.length} bytes)...`);
        
        const result = await new Promise<MegaUploadResult>((resolve, reject) => {
            const buffer = Buffer.from(file);
            const uploadOptions = {
                name: fileName,
                attributes: { mtime: new Date() },
                size: buffer.length
            };

            // Using the callback-based upload for maximum compatibility
            folder.upload(uploadOptions, buffer, async (err: any, megaFile: any) => {
                if (err) {
                    console.error(`[MEGA][${fileName}] Upload Callback Error:`, err.message);
                    return reject(err);
                }

                console.log(`[MEGA][${fileName}] Upload callback received. File node created. waiting 5s for propagation...`);
                await new Promise(r => setTimeout(r, 5000));

                try {
                    let url = '';
                    let folderUrl = '';

                    // Get Folder Link
                    try {
                        folderUrl = await new Promise<string>((res) => {
                            folder.link((lErr: any, lUrl: string) => {
                                if (lErr) {
                                    console.warn(`[MEGA][${fileName}] Folder link error: ${lErr.message}`);
                                    res('');
                                } else res(lUrl);
                            });
                        });
                    } catch (e) { console.warn("Folder link catch:", e); }

                    // Get File Link with retries
                    let linkAttempts = 0;
                    while (!url && linkAttempts < 3) {
                        url = await new Promise<string>((res) => {
                            megaFile.link((lErr: any, lUrl: string) => {
                                if (lErr) {
                                    console.warn(`[MEGA][${fileName}] File link error (Attempt ${linkAttempts + 1}): ${lErr.message}`);
                                    res('');
                                } else res(lUrl);
                            });
                        });
                        if (!url) {
                            linkAttempts++;
                            if (linkAttempts < 3) {
                                console.log(`[MEGA][${fileName}] Link generation empty. Waiting 2s before retry...`);
                                await new Promise(r => setTimeout(r, 2000));
                            }
                        }
                    }

                    if (!url && !folderUrl) {
                        // If we got the file but no link, we still consider it a partial success but warn
                        console.error(`[MEGA][${fileName}] File uploaded but links failed.`);
                        url = 'link-generation-failed';
                    }

                    resolve({
                        name: fileName,
                        size: buffer.length,
                        url: url || folderUrl,
                        folderUrl: folderUrl || url
                    });
                } catch (linkErr: any) {
                    console.error(`[MEGA][${fileName}] Post-upload error:`, linkErr.message);
                    reject(linkErr);
                }
            });
        });

        console.log(`[MEGA][${fileName}] --- UPLOAD COMPLETE ---`);
        console.log(`[MEGA][${fileName}] Result URL: ${result.url}`);
        return result;
    } catch (error: any) {
        const errorMsg = error.message || String(error);
        const isTransient = errorMsg.includes('EAGAIN') || errorMsg.includes('-3') || errorMsg.includes('congestion');
        const isAccessError = errorMsg.includes('EACCESS') || errorMsg.includes('-11');

        if ((isTransient || isAccessError) && retryCount < MAX_RETRIES) {
            // Delay: 2s, 4s, 8s
            const delay = Math.pow(2, retryCount) * 2000; 
            console.warn(`[MEGA][${fileName}] Recoverable error detected (${errorMsg}). Retrying in ${delay}ms...`);
            
            if (isAccessError || (isTransient && retryCount >= 1)) {
                console.log(`[MEGA][${fileName}] Persistent error or Access error. Invalidating session for fresh login on retry.`);
                storage = null; 
            }

            await new Promise(r => setTimeout(r, delay));
            return uploadToMega(file, fileName, quotationID, rootFolderName, retryCount + 1);
        }

        console.error(`[MEGA][${fileName}] --- FATAL ERROR ---`);
        console.error(`[MEGA][${fileName}] Reason: ${errorMsg}`);
        throw error;
    }
}

export async function getFileBufferFromMega(url: string): Promise<Buffer> {
    try {
        const { File } = await import('megajs');
        const file = File.fromURL(url);
        await file.loadAttributes();
        
        return new Promise((resolve, reject) => {
            const stream = (file as any).download({});
            const chunks: any[] = [];
            
            stream.on('data', (chunk: any) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', (err: any) => reject(err));
        });
    } catch (error: any) {
        console.error(`[MEGA] Failed to download file from URL:`, error.message);
        throw error;
    }
}
