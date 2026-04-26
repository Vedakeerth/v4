import { NextRequest, NextResponse } from "next/server";

/**
 * Backend verification for Google reCAPTCHA v2
 */
export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ success: false, error: "Captcha token is missing" }, { status: 400 });
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey) {
            console.error("RECAPTCHA_SECRET_KEY is not defined in environment variables");
            return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
        }

        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${secretKey}&response=${token}`,
        });

        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ success: true });
        } else {
            console.error("reCAPTCHA verification failed:", data["error-codes"]);
            return NextResponse.json({ 
                success: false, 
                error: "reCAPTCHA verification failed",
                details: data["error-codes"] 
            }, { status: 400 });
        }
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
