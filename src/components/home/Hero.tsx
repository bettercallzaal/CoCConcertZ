export default function Hero() {
  return (
    <section className="hero" aria-label="Hero">
      <style>{`
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px;
          position: relative;
          z-index: 1;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(ellipse, rgba(255, 214, 0, 0.12) 0%, rgba(0, 240, 255, 0.04) 40%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-block;
          padding: 8px 24px;
          border: 1px solid var(--cyan);
          border-radius: 0;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--cyan);
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 32px;
          position: relative;
          animation: badge-flicker 4s infinite, hero-fade-in 0.8s ease-out 0.1s both;
        }
        .hero-badge::before,
        .hero-badge::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          border: 1px solid var(--cyan);
        }
        .hero-badge::before { top: -4px; left: -4px; border-right: none; border-bottom: none; }
        .hero-badge::after { bottom: -4px; right: -4px; border-left: none; border-top: none; }

        @keyframes badge-flicker {
          0%, 92%, 100% { opacity: 1; }
          93% { opacity: 0.4; }
          94% { opacity: 1; }
          96% { opacity: 0.6; }
          97% { opacity: 1; }
        }

        .hero-logos {
          position: relative;
          width: clamp(320px, 70vw, 700px);
          height: clamp(200px, 30vw, 340px);
          margin-bottom: 8px;
          animation: hero-scatter-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
        .hero-logos .logo-piece {
          position: absolute;
          border-radius: 10px;
          filter: drop-shadow(0 0 20px rgba(255, 214, 0, 0.2));
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s ease;
          will-change: transform;
        }
        .hero-logos .logo-piece:hover {
          z-index: 10;
          filter: drop-shadow(0 0 36px rgba(255, 214, 0, 0.5)) drop-shadow(0 0 6px rgba(0, 240, 255, 0.3));
        }
        .logo-piece.center {
          width: clamp(140px, 22vw, 240px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          animation: logo-float-center 6s ease-in-out infinite;
        }
        .logo-piece.center:hover { transform: translate(-50%, -50%) scale(1.08); }
        .logo-piece.tl {
          width: clamp(56px, 9vw, 100px);
          top: 0; left: 4%;
          transform: rotate(-12deg);
          opacity: 0.55;
          animation: logo-float-a 5s ease-in-out infinite;
        }
        .logo-piece.tl:hover { transform: rotate(-12deg) scale(1.2); opacity: 1; }
        .logo-piece.tr {
          width: clamp(64px, 10vw, 110px);
          top: -2%; right: 6%;
          transform: rotate(8deg);
          opacity: 0.5;
          animation: logo-float-b 7s ease-in-out infinite;
        }
        .logo-piece.tr:hover { transform: rotate(8deg) scale(1.2); opacity: 1; }
        .logo-piece.bl {
          width: clamp(40px, 6vw, 70px);
          bottom: 2%; left: 12%;
          transform: rotate(15deg);
          opacity: 0.35;
          animation: logo-float-c 8s ease-in-out infinite;
        }
        .logo-piece.bl:hover { transform: rotate(15deg) scale(1.3); opacity: 1; }
        .logo-piece.br {
          width: clamp(50px, 8vw, 88px);
          bottom: 0; right: 10%;
          transform: rotate(-6deg);
          opacity: 0.45;
          animation: logo-float-d 6.5s ease-in-out infinite;
        }
        .logo-piece.br:hover { transform: rotate(-6deg) scale(1.2); opacity: 1; }
        .logo-piece.ml {
          width: clamp(36px, 5vw, 56px);
          top: 55%; left: -2%;
          transform: rotate(22deg);
          opacity: 0.2;
          animation: logo-float-e 9s ease-in-out infinite;
        }
        .logo-piece.ml:hover { transform: rotate(22deg) scale(1.3); opacity: 0.8; }
        .logo-piece.mr {
          width: clamp(44px, 6vw, 64px);
          top: 38%; right: -1%;
          transform: rotate(-18deg);
          opacity: 0.25;
          animation: logo-float-f 7.5s ease-in-out infinite;
        }
        .logo-piece.mr:hover { transform: rotate(-18deg) scale(1.3); opacity: 0.8; }

        @keyframes logo-float-center {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes logo-float-a {
          0%, 100% { transform: rotate(-12deg) translate(0, 0); }
          50% { transform: rotate(-12deg) translate(4px, -6px); }
        }
        @keyframes logo-float-b {
          0%, 100% { transform: rotate(8deg) translate(0, 0); }
          50% { transform: rotate(8deg) translate(-5px, -7px); }
        }
        @keyframes logo-float-c {
          0%, 100% { transform: rotate(15deg) translate(0, 0); }
          50% { transform: rotate(15deg) translate(3px, -5px); }
        }
        @keyframes logo-float-d {
          0%, 100% { transform: rotate(-6deg) translate(0, 0); }
          50% { transform: rotate(-6deg) translate(-4px, -6px); }
        }
        @keyframes logo-float-e {
          0%, 100% { transform: rotate(22deg) translate(0, 0); }
          50% { transform: rotate(22deg) translate(5px, -4px); }
        }
        @keyframes logo-float-f {
          0%, 100% { transform: rotate(-18deg) translate(0, 0); }
          50% { transform: rotate(-18deg) translate(-3px, -5px); }
        }

        /* Glitch pseudo-elements */
        .hero-logos::before,
        .hero-logos::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: clamp(140px, 22vw, 240px);
          height: clamp(140px, 22vw, 240px);
          transform: translate(-50%, -50%);
          background: url('/images/coc-concertz-logo.jpeg') center/contain no-repeat;
          border-radius: 10px;
          pointer-events: none;
          z-index: 4;
        }
        .hero-logos::before {
          animation: glitch-1 3s infinite linear alternate-reverse;
          clip-path: inset(0 0 85% 0);
          mix-blend-mode: screen;
          opacity: 0.4;
          filter: hue-rotate(160deg) saturate(2);
        }
        .hero-logos::after {
          animation: glitch-2 2.5s infinite linear alternate-reverse;
          clip-path: inset(85% 0 0 0);
          mix-blend-mode: screen;
          opacity: 0.3;
          filter: hue-rotate(-40deg) saturate(2);
        }

        @keyframes glitch-1 {
          0%, 87% { transform: translate(-50%, -50%); }
          88% { transform: translate(calc(-50% - 4px), calc(-50% - 2px)); }
          89% { transform: translate(calc(-50% + 4px), calc(-50% + 2px)); }
          90% { transform: translate(calc(-50% - 2px), calc(-50% + 1px)); }
          91%, 100% { transform: translate(-50%, -50%); }
        }
        @keyframes glitch-2 {
          0%, 91% { transform: translate(-50%, -50%); }
          92% { transform: translate(calc(-50% + 3px), calc(-50% + 1px)); }
          93% { transform: translate(calc(-50% - 3px), calc(-50% - 1px)); }
          94% { transform: translate(calc(-50% + 2px), calc(-50% - 1px)); }
          95%, 100% { transform: translate(-50%, -50%); }
        }

        @keyframes hero-scatter-in {
          from { opacity: 0; transform: scale(0.85); filter: blur(8px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes hero-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-anchor-text {
          font-family: var(--font-display);
          font-size: clamp(0.8rem, 1.8vw, 1.1rem);
          letter-spacing: 8px;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          animation: hero-fade-in 0.8s ease-out 0.6s both;
        }
        .hero-anchor-text .x-mark {
          color: var(--yellow);
          font-size: 1.4em;
          font-weight: 700;
        }
        .hero-anchor-text .community-name {
          transition: color 0.3s;
        }
        .hero-anchor-text .community-name:hover {
          color: var(--cyan);
        }
        .hero-subtitle {
          font-family: var(--font-display);
          font-size: clamp(1.2rem, 3vw, 2rem);
          letter-spacing: 12px;
          color: var(--text-dim);
          margin-bottom: 40px;
          text-transform: uppercase;
          animation: hero-fade-in 0.8s ease-out 0.8s both;
        }
        .hero p {
          font-size: clamp(0.9rem, 1.5vw, 1.1rem);
          color: var(--text-dim);
          max-width: 500px;
          line-height: 1.7;
          margin-bottom: 48px;
          animation: hero-fade-in 0.8s ease-out 1s both;
        }
        .cta-btn {
          display: inline-block;
          padding: 18px 52px;
          background: var(--yellow);
          color: #000;
          text-decoration: none;
          font-family: var(--font-display);
          font-size: 1.4rem;
          letter-spacing: 3px;
          transition: all 0.2s;
          position: relative;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          animation: hero-fade-in 0.8s ease-out 1.2s both;
        }
        .cta-btn:hover {
          background: var(--cyan);
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 var(--yellow);
        }

        @media (max-width: 768px) {
          .hero { padding: 40px 16px; min-height: 90vh; }
          .hero-logos { height: clamp(160px, 40vw, 220px); width: 90vw; }
          .logo-piece.ml, .logo-piece.mr { display: none; }
          .hero-badge { font-size: 0.65rem; letter-spacing: 3px; padding: 6px 16px; }
          .hero-anchor-text { letter-spacing: 4px; gap: 10px; font-size: 0.7rem; }
          .hero-subtitle { letter-spacing: 6px; }
          .cta-btn { padding: 14px 36px; font-size: 1.1rem; }
        }
        @media (max-width: 380px) {
          .cta-btn { padding: 12px 28px; font-size: 1rem; }
        }
      `}</style>

      <div className="hero-badge">Live in the Metaverse</div>

      <div className="hero-logos" aria-label="C.O.C. Concertz">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="" className="logo-piece tl" loading="eager" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="" className="logo-piece tr" loading="eager" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="C.O.C. Concertz" className="logo-piece center" loading="eager" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="" className="logo-piece ml" loading="eager" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="" className="logo-piece mr" loading="eager" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="" className="logo-piece bl" loading="eager" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/coc-concertz-logo.jpeg" alt="" className="logo-piece br" loading="eager" />
      </div>

      <div className="hero-anchor-text">
        <span className="community-name">THE ZAO</span>
        <span className="x-mark">&times;</span>
        <span className="community-name">COC</span>
      </div>

      <div className="hero-subtitle">Virtual Stages &middot; Real Music</div>

      <p>Step into immersive virtual venues and experience live music from anywhere in the world. No tickets. No lines. Just vibes.</p>

      <a className="cta-btn" href="#venue">ENTER THE VENUE</a>
    </section>
  );
}
