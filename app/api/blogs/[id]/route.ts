import { NextResponse } from 'next/server';
import { getBlogs, saveBlogs, BlogPost } from '@/lib/blogs';
import { isAuthenticated } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const blogs = getBlogs();
        const index = blogs.findIndex(b => b.id === id);

        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        blogs[index] = { ...blogs[index], ...body, id: id };
        await saveBlogs(blogs);

        return NextResponse.json({ success: true, blog: blogs[index] });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to update blog' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const blogs = getBlogs();
        const filteredBlogs = blogs.filter(b => b.id !== id);

        if (blogs.length === filteredBlogs.length) {
            return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
        }

        await saveBlogs(filteredBlogs);
        return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete blog' }, { status: 500 });
    }
}
