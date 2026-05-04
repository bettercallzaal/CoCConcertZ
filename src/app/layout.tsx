import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WalletProvider } from "@/context/WalletContext";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "COC Concertz — Live Metaverse Concertz",
  description: "COC Concertz hosts free live concertz inside the metaverse. Experience immersive music from anywhere — no tickets, no lines, just vibes.",
  metadataBase: new URL("https://cocconcertz.com"),
  openGraph: {
    title: "COC Concertz — Live Metaverse Concertz",
    description: "Free live concertz inside the metaverse. Experience immersive music from anywhere — no tickets, no lines, just vibes.",
    url: "https://cocconcertz.com",
    siteName: "COC Concertz",
    images: [{ url: "/images/coc5-flyer.png", width: 1023, height: 1023, type: "image/png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COC Concertz — Live Metaverse Concertz",
    description: "Free live concertz inside the metaverse. No tickets, no lines, just vibes.",
    images: ["/images/coc5-flyer.png"],
  },
  icons: {
    icon: "/images/coc-concertz-logo.jpeg",
    apple: "/images/coc-concertz-logo.jpeg",
  },
  themeColor: "#FFD600",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${bebasNeue.variable} ${ibmPlexMono.variable} font-sans`} style={{ fontFamily: "'Satoshi', sans-serif" }}>
        <div className="halftone-bg" />
        <WalletProvider>
          <AuthProvider>{children}</AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
