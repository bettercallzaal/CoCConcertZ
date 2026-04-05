export default function Community() {
  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">Community</span>
      <h2>CONNECT</h2>
      <p style={{ marginBottom: 24 }}>COC ConcertZ is hosted by two Web3 communities building at the intersection of music, art, and culture.</p>
      <div className="socials">
        <a href="https://thezao.com" target="_blank" rel="noopener" aria-label="Visit The ZAO" className="reveal reveal-delay-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/zao-logo.png" alt="The ZAO" style={{ height: 40, width: "auto", borderRadius: 4 }} />
          THE ZAO
        </a>
        <a href="https://communityofcommunities.xyz/" target="_blank" rel="noopener" aria-label="Visit Community of Communities" className="reveal reveal-delay-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/coc-logo-circle.jpeg" alt="Community of Communities" style={{ height: 40, width: 40, borderRadius: "50%", objectFit: "cover" }} />
          COMMUNITY OF COMMUNITIES
        </a>
      </div>
    </section>
  );
}
