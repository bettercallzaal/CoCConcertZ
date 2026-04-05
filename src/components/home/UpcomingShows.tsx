export default function UpcomingShows() {
  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">Schedule</span>
      <h2>UPCOMING SHOWS</h2>
      <ul className="schedule-list">
        <li className="next-up reveal reveal-delay-1">
          <div className="event-info">
            <span className="event-tag">Next Up</span>
            <span className="event-name">+COC CONCERTZ #4</span>
            <span className="event-desc">Live in StiloWorld — Joseph Goats, Stilo, Tom Fellenz</span>
          </div>
          <span className="event-date">APR 11, 2026 @ 4PM EST</span>
        </li>
        <li className="reveal reveal-delay-2">
          <div className="event-info">
            <span className="event-tag">Announced</span>
            <span className="event-name">+COC CONCERTZ #5</span>
            <span className="event-desc">Next metaverse concert — don&apos;t miss it</span>
          </div>
          <span className="event-date">MAY 9, 2026 @ 4PM EST</span>
        </li>
      </ul>
    </section>
  );
}
