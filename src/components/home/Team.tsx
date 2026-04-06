"use client";

const TEAM = [
  {
    handle: "BetterCallZaal",
    name: "ZAAL",
    role: "Co-Founder & Producer",
    bio: "Building at the intersection of music, Web3, and community. Creator of The ZAO ecosystem.",
    links: [
      { label: "Farcaster", url: "https://warpcast.com/bettercallzaal" },
      { label: "Twitter / X", url: "https://twitter.com/BetterCallZaal" },
    ],
    accent: "var(--yellow)",
  },
  {
    handle: "ThyRevolution",
    name: "THY REV",
    role: "Co-Founder & Community Lead",
    bio: "Community builder connecting artists and fans across the metaverse. Community of Communities.",
    links: [
      { label: "Farcaster", url: "https://warpcast.com/thyrevolution" },
    ],
    accent: "var(--cyan)",
  },
];

function TeamCard({
  member,
  delayClass,
}: {
  member: (typeof TEAM)[number];
  delayClass: string;
}) {
  return (
    <div
      className={`reveal ${delayClass}`}
      style={{
        flex: "1 1 260px",
        minWidth: 260,
        background: "var(--card)",
        border: "1px solid var(--border)",
        padding: "28px 24px",
        clipPath:
          "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
      }}
    >
      {/* Corner accent */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 16,
          height: 16,
          background: member.accent,
          clipPath: "polygon(0 0, 100% 100%, 100% 0)",
          opacity: 0.6,
        }}
      />

      {/* Handle tag */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: member.accent,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        @{member.handle}
      </span>

      {/* Name */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "28px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text)",
          lineHeight: 1.05,
        }}
      >
        {member.name}
      </div>

      {/* Role */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--cyan)",
        }}
      >
        {member.role}
      </div>

      {/* Bio */}
      <p
        style={{
          fontSize: "0.9rem",
          lineHeight: 1.6,
          color: "var(--text-dim)",
          margin: 0,
          flexGrow: 1,
        }}
      >
        {member.bio}
      </p>

      {/* Social link pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
        {member.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              padding: "3px 10px",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 2,
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
              letterSpacing: "0.06em",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = member.accent;
              (e.currentTarget as HTMLAnchorElement).style.color = member.accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255,255,255,0.18)";
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.65)";
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">// THE TEAM</span>
      <h2>WHO WE ARE</h2>
      <p style={{ marginBottom: 32 }}>
        COC ConcertZ is brought to you by two builders at the forefront of Web3
        music and community culture.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        {TEAM.map((member, i) => (
          <TeamCard
            key={member.handle}
            member={member}
            delayClass={i === 0 ? "reveal-delay-1" : "reveal-delay-2"}
          />
        ))}
      </div>
    </section>
  );
}
