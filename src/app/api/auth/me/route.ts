import { NextRequest, NextResponse } from "next/server";
import { getCookieAuth } from "@/lib/api-auth";

// Identity endpoint the client reads to decide what UI to show. It used to echo
// back the raw unsigned `coc-role` / `coc-artist-slug` cookies, so anyone could
// hand themselves an admin UI by setting a cookie. Now it reports only what the
// signed session actually proves.
export async function GET(request: NextRequest) {
  const auth = getCookieAuth(request);
  if (auth) {
    return NextResponse.json({ role: auth.role, artistSlug: auth.artistSlug });
  }
  return NextResponse.json({ role: null, artistSlug: null });
}
