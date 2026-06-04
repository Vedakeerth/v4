const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\veda\\web v4\\admin-app\\src';

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    // Replace Next.js imports
    content = content.replace(/import Image from "next\/image";/g, '');
    content = content.replace(/import NextImage from "next\/image";/g, '');
    content = content.replace(/import \{ useRouter \} from "next\/navigation";/g, 'import { useNavigate } from "react-router-dom";');
    content = content.replace(/import \{ useSearchParams \} from "next\/navigation";/g, 'import { useSearchParams } from "react-router-dom";');
    content = content.replace(/import Link from "next\/link";/g, 'import { Link } from "react-router-dom";');
    content = content.replace(/import \{ signOut \} from "next-auth\/react";/g, '');
    content = content.replace(/import \{ signIn, signOut \} from "next-auth\/react";/g, '');

    // Replace Next.js specific cache imports
    content = content.replace(/import \{ unstable_cache \} from 'next\/cache';/g, '');

    // Replace useRouter -> useNavigate
    content = content.replace(/const router = useRouter\(\);/g, 'const navigate = useNavigate();');
    content = content.replace(/router\.push\(/g, 'navigate(');
    content = content.replace(/router\.replace\(/g, 'navigate(');
    content = content.replace(/router\.refresh\(\)/g, 'navigate(0)');

    // Basic replace for Image component
    content = content.replace(/<Image/g, '<img');
    content = content.replace(/fill/g, 'style={{ width: "100%", height: "100%" }}');

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log("Updated: " + filepath);
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
console.log("Done replacing Next.js specific code.");
