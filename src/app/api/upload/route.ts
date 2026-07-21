import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { getCookieAuth } from "@/lib/api-auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Only these Cloudinary folders may be targeted - the folder used to come
// straight from the caller, letting anyone upload anywhere in the account.
const ALLOWED_FOLDERS = new Set(["coc-concertz", "user-uploads", "recaps", "sets"]);

export async function POST(request: NextRequest) {
  // Require an authenticated admin/artist - upload was previously open to anyone.
  const auth = getCookieAuth(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const requestedFolder = (formData.get("folder") as string) || "coc-concertz";
  const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : "coc-concertz";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "auto" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

  return NextResponse.json({ url: (result as { secure_url: string }).secure_url });
}
