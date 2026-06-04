import os

src_dir = r"d:\veda\web v4\admin-app\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Replace Next.js imports
    content = content.replace('import Image from "next/image";', '')
    content = content.replace('import NextImage from "next/image";', '')
    content = content.replace('import { useRouter } from "next/navigation";', 'import { useNavigate } from "react-router-dom";')
    content = content.replace('import { useSearchParams } from "next/navigation";', 'import { useSearchParams } from "react-router-dom";')
    content = content.replace('import Link from "next/link";', 'import { Link } from "react-router-dom";')
    content = content.replace('import { signOut } from "next-auth/react";', '')
    content = content.replace('import { signIn, signOut } from "next-auth/react";', '')

    # Replace Next.js specific cache imports
    content = content.replace("import { unstable_cache } from 'next/cache';", "")

    # Replace useRouter -> useNavigate
    content = content.replace('const router = useRouter();', 'const navigate = useNavigate();')
    content = content.replace('router.push(', 'navigate(')
    content = content.replace('router.replace(', 'navigate(')
    content = content.replace('router.refresh()', 'navigate(0)')

    # Basic replace for Image component
    content = content.replace('<Image', '<img')
    content = content.replace('fill', 'style={{ width: "100%", height: "100%" }}')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done replacing Next.js specific code.")
