import blogsData from '../data/blogs.json';

export interface Comment {
    id: string;
    author: string;
    text: string;
    date: string;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    likes?: number;
    comments?: Comment[];
    hashtags?: string[];
    metaTitle?: string;
    metaDescription?: string;
}

export function getBlogs(): BlogPost[] {
    return blogsData as BlogPost[];
}

export async function saveBlogs(blogs: BlogPost[]) {
    if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'data', 'blogs.json');
        fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2));
    }
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
    const blogs = getBlogs();
    return blogs.find(b => b.slug === slug);
}
