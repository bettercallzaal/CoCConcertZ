import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const role = request.cookies.get("coc-role")?.value;
  if (role === "admin" || role === "artist") {
    const artistSlug = request.cookies.get("coc-artist-slug")?.value ?? null;
    return NextResponse.json({ role, artistSlug });
  }
  return NextResponse.json({ role: null, artistSlug: null });
}
