import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const eventDate = new Date("2026-04-11T20:00:00Z");
  const now = new Date();
  const diffDays = Math.max(
    0,
    Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
        <div
          style={{
            fontSize: 32,
            letterSpacing: "0.2em",
            opacity: 0.6,
            marginBottom: 16,
          }}
        >
          LIVE IN THE METAVERSE
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: "0.05em",
          }}
        >
          COC CONCERTZ #4
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#00F0FF",
            marginTop: 16,
            letterSpacing: "0.15em",
          }}
        >
          APRIL 11, 2026 · 4PM EST
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            marginTop: 32,
          }}
        >
          {diffDays > 0 ? `IN ${diffDays} DAY${diffDays !== 1 ? "S" : ""}` : "TODAY"}
        </div>
        <div
          style={{
            fontSize: 20,
            opacity: 0.4,
            marginTop: 40,
            letterSpacing: "0.3em",
          }}
        >
          COCCONCERTZ.COM
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
