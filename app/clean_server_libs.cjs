const fs = require('fs');
const path = require('path');

const libDir = 'd:\\veda\\web v4\\admin-app\\src\\lib';

// Delete ALL server-only files — these are not needed in the standalone admin app
const toDelete = [
    'firebaseAdmin.ts',
    'mega.ts',
    'seo.ts',
    'seo-utils.ts',
    'email.ts',
    'emailService.ts',
    'crypto.ts',
    'file-utils.ts',
    'order-id.ts',
    'recaptcha.ts',
    'cashfree.ts',
    'shippingCalculator.ts',
    'socials.ts',
    'content.ts',
    'categories.ts',
    'settings.ts',
    'users.ts',
    'orders.ts',
    'blogs.ts',
    'products.ts',
    'projects.ts',
    'testimonials.ts',
];

for (const file of toDelete) {
    const p = path.join(libDir, file);
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log('Deleted: ' + p);
    }
}

console.log('Done cleaning server-side libs.');
