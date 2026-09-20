import { NextRequest, NextResponse } from "next/server";
import { getFileBufferFromMega } from "@/lib/mega";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url || !url.includes("mega.nz")) {
        return new NextResponse("Invalid or missing Mega URL", { status: 400 });
    }

    try {
        const buffer = await getFileBufferFromMega(url);
        
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
            },
        });
    } catch (error: any) {
        console.error("[API][MEGA-IMAGE] Error fetching image:", error);
        return new NextResponse("Error fetching image", { status: 500 });
    }
}
