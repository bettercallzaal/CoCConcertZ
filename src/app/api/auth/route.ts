import { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: "/",
};

export async function POST(request: NextRequest) {
  const { passcode } = await request.json();

  const adminCode = process.env.ADMIN_PASSCODE;
  if (passcode === adminCode && adminCode) {
    const response = NextResponse.json({ role: "admin" });
    response.cookies.set("coc-role", "admin", COOKIE_OPTS);
    return response;
  }

  // Per-artist passcodes: ARTIST_PASSCODES={"xkmpq":"joseph-goats","rvtnw":"stilo"}
  const rawPasscodes = process.env.ARTIST_PASSCODES;
  if (rawPasscodes) {
    try {
      const passcodeMap: Record<string, string> = JSON.parse(rawPasscodes);
      const artistSlug = passcodeMap[passcode];
      if (artistSlug) {
        const response = NextResponse.json({ role: "artist", artistSlug });
        response.cookies.set("coc-role", "artist", COOKIE_OPTS);
        response.cookies.set("coc-artist-slug", artistSlug, COOKIE_OPTS);
        return response;
      }
    } catch {
      console.error("Failed to parse ARTIST_PASSCODES env var");
    }
  }

  return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("coc-role");
  response.cookies.delete("coc-artist-slug");
  return response;
}
