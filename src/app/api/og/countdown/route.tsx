import { ImageResponse } from "next/og";

export const runtime = "edge";

// The next show date. Update this when COC #8 date is locked.
const NEXT_SHOW_DATE: string | null = null; // e.g. "2026-08-09T20:00:00Z"
const NEXT_SHOW_LABEL = "COC CONCERTZ #8";
const NEXT_SHOW_DATE_DISPLAY = "AUG 2026 · DATE TBA";

export async function GET() {
  const now = new Date();

  if (!NEXT_SHOW_DATE) {
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
            color: "#FFD600",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 32, letterSpacing: "0.2em", opacity: 0.6, marginBottom: 16 }}>
            LIVE IN THE METAVERSE
          </div>
          <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: "0.05em" }}>
            {NEXT_SHOW_LABEL}
          </div>
          <div style={{ fontSize: 28, color: "#00F0FF", marginTop: 16, letterSpacing: "0.15em" }}>
            {NEXT_SHOW_DATE_DISPLAY}
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, marginTop: 32 }}>COMING SOON</div>
          <div style={{ fontSize: 20, opacity: 0.4, marginTop: 40, letterSpacing: "0.3em" }}>
            COCCONCERTZ.COM
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const eventDate = new Date(NEXT_SHOW_DATE);
  const diffDays = Math.max(
    0,
    Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

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
          color: "#FFD600",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: "0.2em", opacity: 0.6, marginBottom: 16 }}>
          LIVE IN THE METAVERSE
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: "0.05em" }}>
          {NEXT_SHOW_LABEL}
        </div>
        <div style={{ fontSize: 28, color: "#00F0FF", marginTop: 16, letterSpacing: "0.15em" }}>
          {NEXT_SHOW_DATE_DISPLAY}
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, marginTop: 32 }}>
          {diffDays > 0 ? `IN ${diffDays} DAY${diffDays !== 1 ? "S" : ""}` : "TODAY"}
        </div>
        <div style={{ fontSize: 20, opacity: 0.4, marginTop: 40, letterSpacing: "0.3em" }}>
          COCCONCERTZ.COM
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
