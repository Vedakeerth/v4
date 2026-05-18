import { Storage } from 'megajs';
import { decrypt } from '../lib/crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setupMegaFolders() {
    const email = process.env.MEGA_EMAIL;
    const password = decrypt(process.env.MEGA_PASSWORD || '');

    if (!email || !password) {
        console.error("Credentials missing");
        return;
    }

    console.log(`Logging in to MEGA: ${email}`);
    const storage = new Storage({ email, password });

    await new Promise((resolve, reject) => {
        storage.on('ready', resolve);
        (storage as any).on('error', reject);
    });

    console.log("Logged in. Checking folders...");
    
    const folders = ['INVOICE', 'QUOTATION'];
    
    for (const folderName of folders) {
        const existing = (storage as any).root.children?.find((c: any) => c.name === folderName && (c.type === 1 || c.directory === true));
        if (existing) {
            console.log(`Folder '${folderName}' already exists.`);
        } else {
            console.log(`Creating folder '${folderName}'...`);
            await (storage as any).mkdir(folderName);
            console.log(`Created '${folderName}'.`);
        }
    }

    console.log("Setup complete.");
    process.exit(0);
}

setupMegaFolders().catch(console.error);
