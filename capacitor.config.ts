import type { CapacitorConfig } from "@capacitor/cli";

// iOS/Android shell for cocconcertz.com (TestFlight path - see doc 218 in the
// ZAOOS research library: Capacitor wrapper, zero rewrite). The native shell
// loads the production site, so every Vercel deploy updates the app instantly.
// webDir holds only the offline fallback page.
const config: CapacitorConfig = {
  appId: "com.cocconcertz.app",
  appName: "COC Concertz",
  webDir: "capacitor-shell",
  server: {
    url: "https://www.cocconcertz.com",
    allowNavigation: [
      "cocconcertz.com",
      "*.cocconcertz.com",
      "*.spatial.io",
      "*.twitch.tv",
      "player.twitch.tv",
      "*.youtube.com",
      "*.cloudinary.com",
    ],
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#050505",
  },
};

export default config;
