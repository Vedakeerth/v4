const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\veda\\web v4\\admin-app\\src';

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    content = content.replace(/process\.env\.NEXT_PUBLIC_/g, 'import.meta.env.VITE_');

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log("Updated env vars: " + filepath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
console.log("Done replacing env vars.");
