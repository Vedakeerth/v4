import { NextResponse } from 'next/server';
import { getBlogs, saveBlogs, BlogPost } from '@/lib/blogs';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    try {
        const blogs = getBlogs();
        return NextResponse.json({ success: true, blogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const blog: BlogPost = await req.json();
        const blogs = getBlogs();

        // Generate slug if not provided
        if (!blog.slug) {
            blog.slug = blog.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        }

        if (!blog.id) {
            blog.id = `blog-${Date.now()}`;
        }

        blogs.push(blog);
        saveBlogs(blogs);

        return NextResponse.json({ success: true, blog, message: 'Blog created successfully' });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to create blog' }, { status: 500 });
    }
}
