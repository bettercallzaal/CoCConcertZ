import { ImageResponse } from "next/og";

export const runtime = "edge";

// Social card for the /contest page - days-left countdown to the flyer deadline.
const DEADLINE = new Date("2026-07-11T03:59:00Z"); // Fri Jul 10, 11:59 PM EST

export async function GET() {
  const now = new Date();
  const diffDays = Math.max(
    0,
    Math.ceil((DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const open = DEADLINE.getTime() > now.getTime();

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
            fontSize: 30,
            letterSpacing: "0.25em",
            opacity: 0.6,
            marginBottom: 16,
          }}
        >
          COMMUNITY FLYER CONTEST
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        >
          {open ? "DESIGN THE COC #7 FLYER" : "COC #7 FLYER CONTEST"}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#00F0FF",
            marginTop: 16,
            letterSpacing: "0.15em",
          }}
        >
          WAVEWARZ TAKEOVER · JULY 18 · STILO WORLD
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            marginTop: 32,
          }}
        >
          {open
            ? diffDays > 0
              ? `${diffDays} DAY${diffDays !== 1 ? "S" : ""} LEFT TO SUBMIT`
              : "FINAL HOURS TO SUBMIT"
            : "COMPLETE · WINNER ANNOUNCED"}
        </div>
        <div
          style={{
            fontSize: 22,
            opacity: 0.5,
            marginTop: 40,
            letterSpacing: "0.3em",
          }}
        >
          COCCONCERTZ.COM/CONTEST
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
