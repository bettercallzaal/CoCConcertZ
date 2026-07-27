import { NextRequest, NextResponse } from "next/server";
import { getCookieAuth } from "@/lib/api-auth";
import { getArtistsServer } from "@/lib/db-server";

export async function GET(request: NextRequest) {
  // Signed session only. This route previously trusted the raw `coc-role`
  // cookie, whose value was the literal string "admin" - forgeable with a
  // single curl header.
  const auth = getCookieAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const query = request.nextUrl.searchParams.get("q")?.toLowerCase();

    const artists = await getArtistsServer();

    // If query provided, filter by name/slug match
    const filtered = query
      ? artists.filter(
          (a) =>
            a.stageName.toLowerCase().includes(query) ||
            a.slug.toLowerCase().includes(query)
        )
      : artists;

    // Return just the social handle data needed for @mentions
    const mentions = filtered.map((a) => ({
      name: a.stageName,
      slug: a.slug,
      handles: {
        twitter: a.socialLinks.twitter || null,
        farcaster: a.socialLinks.farcaster || null,
        // Artists don't have bluesky/lens yet, but we'll include the fields
        bluesky: null,
        lens: null,
      },
      profilePhoto: a.profilePhoto || null,
    }));

    return NextResponse.json({ mentions });
  } catch (err) {
    console.error("Resolve mentions error:", err);
    return NextResponse.json(
      { error: "Failed to resolve mentions" },
      { status: 500 }
    );
  }
}
