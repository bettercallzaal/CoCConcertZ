"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Routes that manage their own chrome: home has the hero + scroll-revealed
// StickyNav; admin/portal/login render their own sidebars/shells.
const HIDDEN_PREFIXES = ["/admin", "/portal", "/login"];

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#past-shows", label: "Past Shows" },
  { href: "/#artists", label: "Artists" },
  { href: "/contest", label: "Flyer Contest" },
  { href: "/brand", label: "Brand Kit" },
];

export default function SiteNav() {
  const pathname = usePathname();

  // Hide on home (it has its own nav) and on app shells.
  if (pathname === "/" || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <header className="site-nav">
      <Link href="/" className="site-nav-logo" aria-label="COC Concertz — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="COC Concertz" loading="eager" />
      </Link>
      <nav className="site-nav-links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <style>{`
        .site-nav {
          position: sticky;
          top: 0;
          z-index: 950;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 22px;
          background: rgba(5, 5, 5, 0.88);
          border-bottom: 1px solid rgba(255, 214, 0, 0.18);
          backdrop-filter: blur(8px);
        }
        .site-nav-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .site-nav-logo img {
          height: 34px;
          width: auto;
          display: block;
        }
        .site-nav-links {
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .site-nav-links a {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-decoration: none;
          color: #c8c8c8;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .site-nav-links a:hover {
          color: var(--yellow);
        }
        @media (max-width: 600px) {
          .site-nav { padding: 10px 14px; gap: 10px; }
          .site-nav-logo img { height: 28px; }
          .site-nav-links { gap: 13px; }
          .site-nav-links a { font-size: 0.6rem; letter-spacing: 1px; }
        }
      `}</style>
    </header>
  );
}
