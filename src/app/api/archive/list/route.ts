import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20);
  const show = searchParams.get("show") ?? undefined;
  const artist = searchParams.get("artist") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const uploadType = searchParams.get("uploadType") ?? undefined;

  try {
    const supabase = createServerSupabase();

    let query = supabase
      .from("archive_uploads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (show) {
      query = query.eq("show_id", show);
    }
    if (artist) {
      query = query.contains("artist_slugs", [artist]);
    }
    if (type) {
      query = query.eq("file_type", type);
    }
    if (uploadType) {
      query = query.eq("upload_type", uploadType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Archive list query error:", error);
      return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
    }

    return NextResponse.json({
      items: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err) {
    console.error("Archive list error:", err);
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }
}
