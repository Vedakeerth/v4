const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\veda\\web v4\\admin-app\\src';

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    content = content.replace(/instyle=\{\{ width: "100%", height: "100%" \}\}/g, 'infill');

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log("Fixed fill -> infill: " + filepath);
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
console.log("Done fixing infill.");
