export const config = {
  site: {
    name: "COC Concertz",
    tagline: "Virtual Stages. Real Music.",
    description: "COC Concertz hosts free live concerts inside the metaverse, giving fans a front-row experience from anywhere in the world.",
    url: "https://cocconcertz.com",
  },
  venue: {
    spatialUrl: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    spatialEmbedUrl: "https://www.spatial.io/embed/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349",
    twitchChannel: "bettercallzaal",
  },
  communities: [
    { name: "The ZAO", url: "https://thezao.com", logo: "/images/zao-logo.png" },
    { name: "Community of Communities", url: "https://communityofcommunities.xyz/", logo: "/images/coc-logo-circle.jpeg" },
  ],
  social: {
    farcasterChannel: "cocconcertz",
    youtube: "https://www.youtube.com/watch?v=-ggYAdu4KRE&list=PLAJfhSekeHMLPEd-PjFnuU_UZmXFR5kvA",
  },
  branding: {
    colors: { yellow: "#FFD600", cyan: "#00F0FF", black: "#050505", card: "#0a0a0a", border: "#1a1a1a" },
  },
} as const;
