export default function Footer() {
  return (
    <footer>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/coc-concertz-logo.jpeg" alt="COC Concertz" className="footer-logo" />
      <div style={{ marginBottom: 10 }}>
        <a
          href="/brand"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--cyan)",
            textDecoration: "none",
          }}
        >
          Brand Kit
        </a>
        <span style={{ color: "var(--text-dim)", margin: "0 14px", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>·</span>
        <a
          href="https://github.com/bettercallzaal/CoCConcertZ"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--cyan)",
            textDecoration: "none",
          }}
        >
          GitHub
        </a>
      </div>
      <div>&copy; 2026 COC CONCERTZ &mdash; ALL RIGHTS RESERVED</div>
    </footer>
  );
}
