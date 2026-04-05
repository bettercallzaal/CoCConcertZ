import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const role = request.cookies.get("coc-role")?.value;
  if (role === "admin" || role === "artist") {
    return NextResponse.json({ role });
  }
  return NextResponse.json({ role: null });
}
