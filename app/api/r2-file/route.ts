import { NextResponse } from "next/server";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
        return new NextResponse("Missing key", { status: 400 });
    }

    try {
        const signedUrl = await getSignedDownloadUrl(key);
        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error("R2 File fetch error:", error);
        return new NextResponse("File not found or error", { status: 500 });
    }
}
