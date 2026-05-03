import type { NextRequest } from "next/server";

export type CookieAuth = {
  role: "admin" | "artist";
  artistSlug: string | null;
};

export function getCookieAuth(req: NextRequest): CookieAuth | null {
  const role = req.cookies.get("coc-role")?.value;
  if (role !== "admin" && role !== "artist") return null;
  const artistSlug = req.cookies.get("coc-artist-slug")?.value ?? null;
  return { role, artistSlug };
}

export function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("coc-role")?.value === "admin";
}
