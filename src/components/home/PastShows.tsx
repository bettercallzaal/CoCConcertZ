"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/lib/db";
import type { Event } from "@/lib/types";

const HARDCODED_EVENTS = [
  {
    id: "hc-3",
    name: "+COC CONCERTZ #3",
    desc: "Web3 metaverse music experience in StiloWorld",
    date: "MARCH 7, 2026",
    flyerUrl: "/images/concertz3-flyer.jpeg",
    flyerAlt: "COC ConcertZ #3 Flyer",
  },
  {
    id: "hc-2",
    name: "+COC CONCERTZ #2",
    desc: "Second installment — bigger crowd, bigger sound",
    date: "OCTOBER 11, 2025",
    flyerUrl: "/images/concertz2-flyer.jpg",
    flyerAlt: "COC ConcertZ #2 Flyer",
  },
  {
    id: "hc-1",
    name: "+COC CONCERTZ #1",
    desc: "The first-ever COC Concertz metaverse show",
    date: "MARCH 29, 2025",
    flyerUrl: null,
    flyerAlt: null,
  },
];

const clipPath =
  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))";

function formatEventDate(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default function PastShows() {
  const [events, setEvents] = useState<Event[]>([]);
  const [useFirestore, setUseFirestore] = useState(false);

  useEffect(() => {
    getEvents()
      .then((all) => {
        const completed = all.filter((e) => e.status === "completed");
        if (completed.length > 0) {
          setEvents(completed);
          setUseFirestore(true);
        }
      })
      .catch((err) => {
        console.warn("PastShows: Firestore fetch failed, using hardcoded data", err);
      });
  }, []);

  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">Archive</span>
      <h2>PAST SHOWS</h2>
      <div className="past-shows-grid">
        {useFirestore
          ? events.map((event, i) => (
              <div
                key={event.id}
                className={`past-show-card reveal reveal-delay-${i + 1}`}
              >
                <span className="past-show-tag">Completed</span>
                <div className="event-name">+COC CONCERTZ #{event.number}</div>
                <div className="event-desc">{event.description}</div>
                <div className="event-date">{formatEventDate(event.date)}</div>
                {event.flyerUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.flyerUrl}
                    alt={`COC ConcertZ #${event.number} Flyer`}
                    style={{
                      width: "100%",
                      borderRadius: 4,
                      marginTop: 12,
                      clipPath,
                    }}
                  />
                )}
              </div>
            ))
          : HARDCODED_EVENTS.map((event, i) => (
              <div
                key={event.id}
                className={`past-show-card reveal reveal-delay-${i + 1}`}
              >
                <span className="past-show-tag">Completed</span>
                <div className="event-name">{event.name}</div>
                <div className="event-desc">{event.desc}</div>
                <div className="event-date">{event.date}</div>
                {event.flyerUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.flyerUrl}
                    alt={event.flyerAlt ?? ""}
                    style={{
                      width: "100%",
                      borderRadius: 4,
                      marginTop: 12,
                      clipPath,
                    }}
                  />
                )}
              </div>
            ))}
      </div>
      <div className="cta-row">
        <a
          className="cta-btn cta-btn-outline"
          href="https://www.youtube.com/watch?v=-ggYAdu4KRE&list=PLAJfhSekeHMLPEd-PjFnuU_UZmXFR5kvA"
          target="_blank"
          rel="noopener"
          style={{ fontSize: "0.95rem", padding: "12px 32px" }}
        >
          WATCH ON YOUTUBE
        </a>
      </div>
    </section>
  );
}
