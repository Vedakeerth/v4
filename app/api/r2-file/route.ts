import { NextResponse } from "next/server";
import { getFileStreamFromR2 } from "@/lib/r2";
import { r2Client, R2_BUCKET } from "@/lib/r2/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
        return new NextResponse("Missing key", { status: 400 });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
        });
        const response = await r2Client.send(command);
        
        // Convert the Node stream to a Web ReadableStream
        const stream = response.Body?.transformToWebStream();

        return new NextResponse(stream, {
            headers: {
                "Content-Type": response.ContentType || "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("R2 File fetch error:", error);
        return new NextResponse("File not found or error", { status: 500 });
    }
}
