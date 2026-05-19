import fs from 'fs';

const content = fs.readFileSync('app/checkout/page.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.toLowerCase().includes('recaptcha')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});
