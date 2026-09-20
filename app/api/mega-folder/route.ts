import { NextRequest, NextResponse } from "next/server";
import { File } from "megajs";

export async function POST(req: NextRequest) {
    try {
        const { folderUrl } = await req.json();

        if (!folderUrl || !folderUrl.includes("mega.nz/folder/")) {
            return NextResponse.json({ success: false, error: "Invalid Mega folder URL" }, { status: 400 });
        }

        const folder = File.fromURL(folderUrl);
        await folder.loadAttributes();

        if (!folder.children) {
            return NextResponse.json({ success: false, error: "Folder is empty or invalid" }, { status: 400 });
        }

        const imageUrls: string[] = [];

        for (const child of folder.children) {
            // Check if it's a file (type 0)
            if (!child.directory) {
                // Generate a link for the file
                try {
                    const url = await child.link(false);
                    imageUrls.push(url);
                } catch (linkErr) {
                    console.warn(`[MEGA-FOLDER] Failed to generate link for ${child.name}`, linkErr);
                }
            }
        }

        return NextResponse.json({ success: true, urls: imageUrls });
    } catch (error: any) {
        console.error("[API][MEGA-FOLDER] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message || "Failed to load folder" }, { status: 500 });
    }
}
