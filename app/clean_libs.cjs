const fs = require('fs');
const path = require('path');

const libDir = 'd:\\veda\\web v4\\admin-app\\src\\lib';

const filesToClean = ['products.ts', 'orders.ts', 'projects.ts', 'testimonials.ts', 'users.ts', 'blogs.ts'];

for (const file of filesToClean) {
    const p = path.join(libDir, file);
    if (fs.existsSync(p)) {
        let content = `export * from '@/types';\n`;
        // if products, maybe keep generateProductCode?
        if (file === 'products.ts') {
            content += `export function generateProductCode(category: string): string {
    const words = (category || 'Uncategorized').split(' ').filter(w => w.length > 0);
    let prefix = "";
    if (words.length >= 2) {
        prefix = (words[0][0] + (words[1] ? words[1][0] : '')).toUpperCase();
    } else if (words.length === 1) {
        prefix = words[0].substring(0, 2).toUpperCase();
    } else {
        prefix = "PR";
    }
    prefix = prefix.slice(0, 3);
    const random = Math.floor(1000 + Math.random() * 9000);
    return \`\${prefix}\${random}\`;
}\n`;
        }
        fs.writeFileSync(p, content, 'utf8');
        console.log("Cleaned " + p);
    }
}

// Delete firebaseAdmin.ts and mega.ts entirely
const deleteFiles = ['firebaseAdmin.ts', 'mega.ts', 'seo.ts', 'seo-utils.ts'];
for (const file of deleteFiles) {
    const p = path.join(libDir, file);
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log("Deleted " + p);
    }
}
