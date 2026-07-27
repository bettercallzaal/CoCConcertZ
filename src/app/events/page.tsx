import type { Metadata } from "next";
import { getEventsServer } from "@/lib/db-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — COC Concertz",
  description:
    "All COC Concertz shows — live music events in Stilo World metaverse. Past recaps and upcoming shows.",
  openGraph: {
    title: "Events — COC Concertz",
    description:
      "All COC Concertz shows — live music events in Stilo World metaverse.",
    url: "https://cocconcertz.com/events",
    siteName: "COC Concertz",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Events — COC Concertz",
    description:
      "All COC Concertz shows — live music events in Stilo World metaverse.",
  },
};

function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_LABEL: Record<string, string> = {
  completed: "Past Show",
  live: "Live Now",
  upcoming: "Upcoming",
};

const STATUS_COLOR: Record<string, string> = {
  completed: "var(--text-dim)",
  live: "#00ff88",
  upcoming: "var(--yellow)",
};

export default async function EventsPage() {
  const events = await getEventsServer();

  const completed = events.filter((e) => e.status === "completed");
  const active = events.filter((e) => e.status !== "completed");

  return (
    <>
      {/* Back nav */}
      <div
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          COC Concertz
        </a>
      </div>

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div
            className="section-label"
            style={{ color: "var(--yellow)", marginBottom: "12px" }}
          >
            Show History
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 5rem)",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--yellow)",
              lineHeight: 1,
              textShadow: "0 0 60px rgba(255,214,0,0.25)",
            }}
          >
            Events
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "2px",
              color: "var(--text-dim)",
              marginTop: "16px",
              textTransform: "uppercase",
            }}
          >
            {events.length > 0
              ? `${events.length} show${events.length !== 1 ? "s" : ""} in the COC Concertz archive`
              : "No shows yet"}
          </p>
        </div>

        {/* Active / upcoming shows */}
        {active.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            {active.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Past shows */}
        {completed.length > 0 && (
          <>
            {active.length > 0 && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Past Shows
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {completed.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}

        {events.length === 0 && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--text-dim)",
              letterSpacing: "2px",
            }}
          >
            Shows coming soon.
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "40px",
            marginTop: "60px",
            textAlign: "center",
          }}
        >
          <a href="/" style={{ display: "inline-block", marginBottom: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/coc-concertz-logo.jpeg"
              alt="COC Concertz"
              style={{
                height: "48px",
                width: "auto",
                opacity: 0.6,
                filter: "drop-shadow(0 0 8px rgba(255,214,0,0.2))",
              }}
            />
          </a>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--text-dim)",
            }}
          >
            Live in the Metaverse
          </div>
        </div>
      </main>
    </>
  );
}

interface EventCardProps {
  event: {
    id: string;
    name: string;
    number: number;
    date: Date;
    status: string;
    flyerUrl?: string;
    description: string;
    recap?: { summary: string };
  };
}

function EventCard({ event }: EventCardProps) {
  const statusColor = STATUS_COLOR[event.status] ?? "var(--text-dim)";
  const statusLabel = STATUS_LABEL[event.status] ?? event.status;

  return (
    <a
      href={`/events/${event.number}`}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "20px",
        padding: "20px 24px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        clipPath:
          "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
        textDecoration: "none",
        transition: "border-color 0.2s",
        marginBottom: "12px",
      }}
    >
      {/* Flyer thumbnail */}
      {event.flyerUrl && (
        <div
          style={{
            width: "64px",
            height: "64px",
            flexShrink: 0,
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.flyerUrl}
            alt={event.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "6px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--text-dim)",
            }}
          >
            #{event.number}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#fff",
            marginBottom: "6px",
            lineHeight: 1.2,
          }}
        >
          {event.name}
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--text-dim)",
            letterSpacing: "1px",
            marginBottom: event.recap?.summary ? "8px" : 0,
          }}
        >
          {formatEventDate(event.date)}
        </div>

        {event.recap?.summary && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--text-dim)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.recap.summary}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "2px",
          color: "var(--yellow)",
          opacity: 0.7,
          flexShrink: 0,
          alignSelf: "center",
        }}
      >
        →
      </div>
    </a>
  );
}
