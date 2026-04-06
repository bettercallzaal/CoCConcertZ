import Script from "next/script";
import Hero from "@/components/home/Hero";
import Countdown from "@/components/home/Countdown";
import VenueEmbed from "@/components/home/VenueEmbed";
import About from "@/components/home/About";
import HowToJoin from "@/components/home/HowToJoin";
import UpcomingShows from "@/components/home/UpcomingShows";
import PastShows from "@/components/home/PastShows";
import Community from "@/components/home/Community";
import ArtistLineup from "@/components/home/ArtistLineup";
import ShareSection from "@/components/home/ShareSection";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/home/Footer";
import StickyNav from "@/components/home/StickyNav";
import ScrollReveal from "@/components/home/ScrollReveal";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import VisitorCount from "@/components/home/VisitorCount";

export default function Home() {
  return (
    <>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Sticky Nav Logo */}
      <StickyNav />

      {/* Corner Decorations */}
      <div className="corner-decoration top-left" />
      <div className="corner-decoration bottom-right" />
      <div className="side-text left">COC Concertz &mdash; Live in the Metaverse</div>
      <div className="side-text right">Web3 Music &mdash; Free Entry &mdash; No Boundaries</div>

      <main>
        {/* Hero */}
        <Hero />

        {/* Next Show Countdown */}
        <Countdown />

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
          <HowToJoin />
          <div className="section-divider" />
          <UpcomingShows />
          <div className="section-divider" />
          <PastShows />
          <div className="section-divider" />
          <Community />
        </div>

        <div className="section-slash" />

        {/* Share */}
        <ShareSection />

        <div className="section-slash" />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      <Footer />

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
                      text: 'Come check out COC Concertz #4 — live metaverse concert happening now!',
                      embeds: ['https://cocconcertz.com'],
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
