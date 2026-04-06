import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  // Fallback values when no slug or artist not found
  let stageName = "ARTIST";
  let accentColor = "#FFD600";

  if (slug) {
    try {
      // Lazy import to avoid Firebase Admin init at build time
      const { adminDb } = await import("@/lib/firebase-admin");
      const snapshot = await adminDb
        .collection("artists")
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        stageName = (data.stageName as string) ?? "ARTIST";
        accentColor =
          (data.cardCustomization?.primaryColor as string | undefined) ??
          "#FFD600";
      }
    } catch {
      // Fall through to defaults on any DB error
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "500px",
            background: `radial-gradient(ellipse, ${accentColor}22 0%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Event branding */}
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.35em",
            color: "#ffffff",
            opacity: 0.35,
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          COC CONCERTZ
        </div>

        {/* Divider line */}
        <div
          style={{
            width: 60,
            height: 2,
            backgroundColor: accentColor,
            marginBottom: 28,
            opacity: 0.7,
            display: "flex",
          }}
        />

        {/* Artist name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: accentColor,
            textAlign: "center",
            lineHeight: 1,
            padding: "0 60px",
            textTransform: "uppercase",
          }}
        >
          {stageName}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            letterSpacing: "0.3em",
            color: "#ffffff",
            opacity: 0.3,
            textTransform: "uppercase",
          }}
        >
          {`COCCONCERTZ.COM/ARTISTS/${slug ?? ""}`}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
