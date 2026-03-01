import { NextResponse } from 'next/server';
import { getBlogs, saveBlogs, Comment } from '@/lib/blogs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { author, text } = await req.json();

        if (!author || !text) {
            return NextResponse.json({ success: false, message: 'Author and text are required' }, { status: 400 });
        }

        const blogs = getBlogs();
        const blogIndex = blogs.findIndex(b => b.id === id);

        if (blogIndex === -1) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        const blog = blogs[blogIndex];
        if (!blog.comments) blog.comments = [];

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            author,
            text,
            date: new Date().toISOString()
        };

        blog.comments.push(newComment);
        blogs[blogIndex] = blog;
        saveBlogs(blogs);

        return NextResponse.json({ success: true, comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ success: false, message: 'Failed to add comment' }, { status: 500 });
    }
}
