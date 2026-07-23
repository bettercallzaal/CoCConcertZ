import Script from "next/script";
import Hero from "@/components/home/Hero";
import Countdown from "@/components/home/Countdown";
import VenueEmbed from "@/components/home/VenueEmbed";
import About from "@/components/home/About";
import HowToJoin from "@/components/home/HowToJoin";
import UpcomingShows from "@/components/home/UpcomingShows";
import PastShows from "@/components/home/PastShows";
import Community from "@/components/home/Community";
import Team from "@/components/home/Team";
import FanGallery from "@/components/home/FanGallery";
import ArtistLineup from "@/components/home/ArtistLineup";
import ShareSection from "@/components/home/ShareSection";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/home/Footer";
import StickyNav from "@/components/home/StickyNav";
import ScrollReveal from "@/components/home/ScrollReveal";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import VisitorCount from "@/components/home/VisitorCount";
import NowPlaying from "@/components/home/NowPlaying";
import LiveChat from "@/components/home/LiveChat";
import LiveMode from "@/components/home/LiveMode";
import ShowRecap from "@/components/home/ShowRecap";
import EmailSignup from "@/components/home/EmailSignup";
import VideoHighlights from "@/components/home/VideoHighlights";
import BattleVote from "@/components/home/BattleVote";
import BadgeClaim from "@/components/home/BadgeClaim";
import WaveWarzHistory from "@/components/home/WaveWarzHistory";

// Structured data for the next show - update per event rollover (see
// docs/coc7-prep-checklist.md). Was previously only in the legacy index.html.
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: "COC Concertz #8: Coming Soon",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  location: {
    "@type": "VirtualLocation",
    url: "https://www.spatial.io/s/Dope-Stilo-Music-Club-66ed19e8c23d0d0c2a3d51c0",
  },
  image: ["https://cocconcertz.com/images/coc-banner-dark.jpeg"],
  description:
    "COC Concertz #8 — live virtual music + WaveWarZ battles. Free entry, no wallet required. Date announcement coming soon.",
  organizer: {
    "@type": "Organization",
    name: "COC Concertz",
    url: "https://cocconcertz.com",
  },
  performer: [{ "@type": "MusicGroup", name: "DJ Zaal" }],
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    url: "https://ticket.cocconcertz.com",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/PreOrder",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      {/* Live Mode Takeover */}
      <LiveMode />

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Sticky Nav Logo */}
      <StickyNav />

      {/* Corner Decorations */}
      <div className="corner-decoration top-left" />
      <div className="corner-decoration bottom-right" />
      <div className="side-text left">COC Concertz - Live in the Metaverse</div>
      <div className="side-text right">Web3 Music - Free Entry - No Boundaries</div>

      <main>
        {/* Hero */}
        <Hero />

        {/* Next Show Countdown */}
        <Countdown />

        {/* Live Battle Vote (renders only when a battle is live) */}
        <BattleVote />

        {/* Attendance badge (renders during a live show + 7-day recap window) */}
        <BadgeClaim />

        {/* Post-Show Recap (shows for 7 days after a completed event) */}
        <ShowRecap />

        {/* Live Visitor Count */}
        <VisitorCount />

        {/* Venue Embed */}
        <VenueEmbed />

        <div className="section-slash" />

        {/* Content Sections */}
        <div className="content">
          <About />
          <div className="section-divider" />
          <ArtistLineup />
          <div className="section-divider" />
          <WaveWarzHistory />
          <div className="section-divider" />
          <HowToJoin />
          <div className="section-divider" />
          <UpcomingShows />
          <div className="section-divider" />
          <PastShows />
          <div className="section-divider" />
          <VideoHighlights />
          <div className="section-divider" />
          <EmailSignup />
          <div className="section-divider" />
          <Community />
          <div className="section-divider" />
          <Team />
          <div className="section-divider" />
          <FanGallery />
        </div>

        <div className="section-slash" />

        {/* Share */}
        <ShareSection />

        <div className="section-slash" />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      <Footer />

      {/* Now Playing Bar */}
      <NowPlaying />

      {/* Live Chat */}
      <LiveChat />

      {/* Scroll Reveal Observer */}
      <ScrollReveal />

      {/* Farcaster Mini App SDK */}
      <Script
        id="farcaster-sdk"
        type="module"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var { sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk');
              await sdk.actions.ready();
              var context = await sdk.context;
              var isFarcaster = !!context;
              if (isFarcaster) {
                var farcasterBtn = document.getElementById('shareFarcaster');
                if (farcasterBtn) {
                  farcasterBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    sdk.actions.composeCast({
                      text: "COC Concertz #8 is coming. Live music + WaveWarZ battles. Free entry, no wallet needed:",
                      embeds: ['https://ticket.cocconcertz.com'],
                      channelKey: 'cocconcertz'
                    });
                  });
                }
              }
            } catch (err) {
              console.warn('Farcaster SDK not available:', err);
            }
          `,
        }}
      />
    </>
  );
}
