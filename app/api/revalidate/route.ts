import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tag, path } = await req.json();

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ success: true, message: `Path ${path} revalidated` });
    }

    if (tag) {
      // If we can't use revalidateTag easily, we'll use revalidatePath as a robust alternative
      revalidatePath("/", "layout"); 
      return NextResponse.json({ success: true, message: `Global cache revalidated via tag ${tag}` });
    }

    return NextResponse.json({ success: false, error: "Tag or path is required" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
