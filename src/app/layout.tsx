import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
  title: "COC Concertz — Live Metaverse Concerts",
  description: "COC Concertz hosts free live concerts inside the metaverse. Experience immersive music from anywhere — no tickets, no lines, just vibes.",
  metadataBase: new URL("https://cocconcertz.com"),
  openGraph: {
    title: "COC Concertz — Live Metaverse Concerts",
    description: "Free live concerts inside the metaverse. Experience immersive music from anywhere — no tickets, no lines, just vibes.",
    url: "https://cocconcertz.com",
    siteName: "COC Concertz",
    images: [{ url: "/images/coc4.jpg", width: 1500, height: 843, type: "image/jpeg" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COC Concertz — Live Metaverse Concerts",
    description: "Free live concerts inside the metaverse. No tickets, no lines, just vibes.",
    images: ["/images/coc4.jpg"],
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
