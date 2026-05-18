import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'vaelinsa@gmail.com';
const ADMIN_PASSWORD = 'Vaelinsa24!';

// Simple rate limiting (in production, use Redis or similar)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    if (!attempt) {
        loginAttempts.set(ip, { count: 1, resetTime: now + LOCKOUT_DURATION });
        return true;
    }

    if (now > attempt.resetTime) {
        loginAttempts.delete(ip);
        loginAttempts.set(ip, { count: 1, resetTime: now + LOCKOUT_DURATION });
        return true;
    }

    if (attempt.count >= MAX_ATTEMPTS) {
        return false; // Locked out
    }

    attempt.count++;
    return true;
}

function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIP = request.headers.get('x-real-ip');
    return realIP || 'unknown';
}

export async function POST(req: Request) {
    try {
        const clientIP = getClientIP(req);
        
        // Check rate limiting
        if (!checkRateLimit(clientIP)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Too many login attempts. Please try again later.' 
            }, { status: 429 });
        }

        const body = await req.json();
        const { email, password } = body;

        // Validate credentials
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Reset rate limit on successful login
            loginAttempts.delete(clientIP);
            
            // Create a simple session token (in production, use JWT or proper session management)
            const sessionToken = Buffer.from(`${email}:${Date.now()}:${Math.random()}`).toString('base64');
            
            // Set cookie (expires in 24 hours)
            const cookieStore = await cookies();
            cookieStore.set('admin_session', sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return NextResponse.json({ 
                success: true, 
                message: 'Login successful' 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid credentials' 
            }, { status: 401 });
        }
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Login failed' 
        }, { status: 500 });
    }
}
