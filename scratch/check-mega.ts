const megajs = require('megajs');
const { decrypt } = require('../lib/crypto');
require('dotenv').config({ path: '.env.local' });

async function checkMega() {
    const email = process.env.MEGA_EMAIL;
    const password = decrypt(process.env.MEGA_PASSWORD || '');
    
    console.log(`Logging into MEGA: ${email}`);
    const s = new (megajs.Storage as any)({ email, password });
    
    await new Promise((resolve, reject) => {
        s.on('ready', resolve);
        s.on('error', reject);
    });
    
    console.log("Ready!");
    console.log("Root name:", s.root.name);
    console.log("Root children count:", s.root.children ? s.root.children.length : 0);
    
    if (s.root.children) {
        console.log("Children names:");
        s.root.children.forEach((c: any) => console.log(` - ${c.name} (${c.type === 1 ? 'Folder' : 'File'})`));
    }
    
    // Check quota
    try {
        const quota = await s.getAccountInfo();
        console.log("Account Info:", JSON.stringify(quota, null, 2));
    } catch (e) {
        console.log("Could not fetch account info (might not be supported by this version of megajs)");
    }
    
    process.exit(0);
}

checkMega().catch(err => {
    console.error(err);
    process.exit(1);
});
