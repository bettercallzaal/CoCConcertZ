export default function PastShows() {
  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">Archive</span>
      <h2>PAST SHOWS</h2>
      <div className="past-shows-grid">
        <div className="past-show-card reveal reveal-delay-1">
          <span className="past-show-tag">Completed</span>
          <div className="event-name">+COC CONCERTZ #3</div>
          <div className="event-desc">Web3 metaverse music experience in StiloWorld</div>
          <div className="event-date">MARCH 7, 2026</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/concertz3-flyer.jpeg"
            alt="COC ConcertZ #3 Flyer"
            style={{
              width: "100%",
              borderRadius: 4,
              marginTop: 12,
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          />
        </div>
        <div className="past-show-card reveal reveal-delay-2">
          <span className="past-show-tag">Completed</span>
          <div className="event-name">+COC CONCERTZ #2</div>
          <div className="event-desc">Second installment — bigger crowd, bigger sound</div>
          <div className="event-date">OCTOBER 11, 2025</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/concertz2-flyer.jpg"
            alt="COC ConcertZ #2 Flyer"
            style={{
              width: "100%",
              borderRadius: 4,
              marginTop: 12,
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          />
        </div>
        <div className="past-show-card reveal reveal-delay-3">
          <span className="past-show-tag">Completed</span>
          <div className="event-name">+COC CONCERTZ #1</div>
          <div className="event-desc">The first-ever COC Concertz metaverse show</div>
          <div className="event-date">MARCH 29, 2025</div>
        </div>
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
