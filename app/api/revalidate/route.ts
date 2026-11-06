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
      try {
        (revalidateTag as any)(tag);
      } catch (err) {
        console.warn("revalidateTag error:", err);
      }
      revalidatePath("/", "layout");
      revalidatePath("/gallery");
      revalidatePath("/products");
      return NextResponse.json({ success: true, message: `Cache revalidated via tag ${tag}` });
    }

    return NextResponse.json({ success: false, error: "Tag or path is required" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
