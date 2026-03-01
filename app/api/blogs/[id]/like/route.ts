import { NextResponse } from 'next/server';
import { getBlogs, saveBlogs } from '@/lib/blogs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { increment } = await req.json();
        const blogs = getBlogs();
        const blogIndex = blogs.findIndex(b => b.id === id);

        if (blogIndex === -1) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        const blog = blogs[blogIndex];
        if (!blog.likes) blog.likes = 0;

        if (increment) {
            blog.likes += 1;
        } else {
            blog.likes = Math.max(0, blog.likes - 1);
        }

        blogs[blogIndex] = blog;
        saveBlogs(blogs);

        return NextResponse.json({ success: true, likes: blog.likes });
    } catch (error) {
        console.error('Error updating likes:', error);
        return NextResponse.json({ success: false, message: 'Failed to update likes' }, { status: 500 });
    }
}
