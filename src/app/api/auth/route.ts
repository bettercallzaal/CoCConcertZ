import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { passcode, role } = await request.json();

  const adminCode = process.env.ADMIN_PASSCODE;
  const artistCode = process.env.ARTIST_PASSCODE;

  if (passcode === adminCode && adminCode) {
    const response = NextResponse.json({ role: "admin" });
    response.cookies.set("coc-role", "admin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  if (passcode === artistCode && artistCode) {
    const response = NextResponse.json({ role: "artist" });
    response.cookies.set("coc-role", "artist", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("coc-role");
  return response;
}
