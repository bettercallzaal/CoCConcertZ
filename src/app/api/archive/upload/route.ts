import { NextRequest, NextResponse } from "next/server";
import { config as siteConfig } from "../../../../../concertz.config";
import { uploadToArweave } from "@/lib/arweave";
import { checkTokenBalance } from "@/lib/tokenGate";
import { createServerSupabase } from "@/lib/supabase";
import type { UploadType, ArchiveFileType } from "@/lib/types";

function detectFileType(contentType: string): ArchiveFileType {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  return "document";
}

export async function POST(request: NextRequest) {
  // 1. Auth: check coc-role cookie
  const role = request.cookies.get("coc-role")?.value;
  if (role !== "admin" && role !== "artist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Parse FormData
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const walletAddress = formData.get("walletAddress") as string | null;
    const title = formData.get("title") as string | null;
    const description = (formData.get("description") as string | null) ?? "";
    const tagsRaw = formData.get("tags") as string | null;
    const showId = (formData.get("showId") as string | null) ?? null;
    const artistSlugsRaw = formData.get("artistSlugs") as string | null;
    const uploadTypeRaw = (formData.get("uploadType") as string | null) ?? "simple";
    const udlLicenseRaw = formData.get("udlLicense") as string | null;

    // 3. Validate required fields
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    // Parse JSON fields
    const tags: string[] = tagsRaw ? JSON.parse(tagsRaw) : [];
    const artistSlugs: string[] = artistSlugsRaw ? JSON.parse(artistSlugsRaw) : [];
    const uploadType = uploadTypeRaw as UploadType;
    const udlLicense = udlLicenseRaw ? JSON.parse(udlLicenseRaw) : null;

    // 4. Token gate check
    const { tokenAddress, minBalance } = siteConfig.archive.tokenGate;
    const { eligible, balance } = await checkTokenBalance(
      walletAddress,
      tokenAddress,
      minBalance
    );
    if (!eligible) {
      return NextResponse.json(
        { error: "Insufficient token balance", balance, required: minBalance },
        { status: 403 }
      );
    }

    // 5. Upload to Arweave
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const contentType = file.type || "application/octet-stream";
    const fileType = detectFileType(contentType);

    const arweaveTags: { name: string; value: string }[] = [
      { name: "Title", value: title },
    ];
    if (uploadType === "atomic_asset") {
      arweaveTags.push({ name: "Type", value: "atomic_asset" });
    }

    const { txId, gatewayUrl } = await uploadToArweave(fileBuffer, contentType, arweaveTags);

    // 6. Save to Supabase
    const supabase = createServerSupabase();
    const { data, error: dbError } = await supabase
      .from("archive_uploads")
      .insert({
        arweave_tx_id: txId,
        gateway_url: gatewayUrl,
        upload_type: uploadType,
        file_type: fileType,
        file_size_bytes: fileBuffer.length,
        title,
        description,
        tags,
        show_id: showId || null,
        artist_slugs: artistSlugs,
        uploaded_by_wallet: walletAddress,
        udl_license: udlLicense,
        manifest_children: null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: "Failed to save upload record" }, { status: 500 });
    }

    // 7. Return result
    return NextResponse.json({
      id: data.id,
      arweave_tx_id: data.arweave_tx_id,
      gateway_url: data.gateway_url,
    });
  } catch (err) {
    // 8. Catch errors
    console.error("Archive upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
