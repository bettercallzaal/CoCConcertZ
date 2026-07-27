"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/lib/db";
import type { Event } from "@/lib/types";

const HARDCODED_EVENTS = [
  {
    id: "hc-8",
    tag: "Coming Soon",
    name: "+COC CONCERTZ #8",
    desc: "The next chapter. Date and artists TBA — sign up at ticket.cocconcertz.com to be notified.",
    date: "AUG 2026 · DATE TBA",
    isNextUp: true,
    rsvpLink: "https://ticket.cocconcertz.com",
  },
];

function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase() + " @ 4PM EST";
}

export default function UpcomingShows() {
  const [events, setEvents] = useState<Event[]>([]);
  const [useFirestore, setUseFirestore] = useState(false);

  useEffect(() => {
    getEvents()
      .then((all) => {
        const upcoming = all.filter(
          (e) => e.status === "upcoming" || e.status === "live"
        );
        if (upcoming.length > 0) {
          setEvents(upcoming);
          setUseFirestore(true);
        }
      })
      .catch((err) => {
        console.warn("UpcomingShows: Firestore fetch failed, using hardcoded data", err);
      });
  }, []);

  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">Schedule</span>
      <h2>UPCOMING SHOWS</h2>
      <ul className="schedule-list">
        {useFirestore
          ? events.map((event, i) => {
              const inner = (
                <>
                  <div className="event-info">
                    <span className="event-tag">
                      {event.status === "live" ? "LIVE NOW" : i === 0 ? "Next Up" : "Announced"}
                    </span>
                    <span className="event-name">+COC CONCERTZ #{event.number}</span>
                    <span className="event-desc">{event.description}</span>
                  </div>
                  <span className="event-date">{formatEventDate(event.date)}</span>
                </>
              );
              return event.rsvpLink ? (
                <li key={event.id} className={`reveal reveal-delay-${i + 1}${i === 0 ? " next-up" : ""}`}>
                  <a href={event.rsvpLink} target="_blank" rel="noopener" className="event-link">{inner}</a>
                </li>
              ) : (
                <li key={event.id} className={`reveal reveal-delay-${i + 1}${i === 0 ? " next-up" : ""}`}>{inner}</li>
              );
            })
          : HARDCODED_EVENTS.map((event) => {
              const inner = (
                <>
                  <div className="event-info">
                    <span className="event-tag">{event.tag}</span>
                    <span className="event-name">{event.name}</span>
                    <span className="event-desc">{event.desc}</span>
                  </div>
                  <span className="event-date">{event.date}</span>
                </>
              );
              return event.rsvpLink ? (
                <li key={event.id} className={`reveal reveal-delay-${event.isNextUp ? "1" : "2"}${event.isNextUp ? " next-up" : ""}`}>
                  <a href={event.rsvpLink} target="_blank" rel="noopener" className="event-link">{inner}</a>
                </li>
              ) : (
                <li key={event.id} className={`reveal reveal-delay-${event.isNextUp ? "1" : "2"}${event.isNextUp ? " next-up" : ""}`}>{inner}</li>
              );
            })}
      </ul>
    </section>
  );
}
