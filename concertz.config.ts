export const config = {
  site: {
    name: "COC Concertz",
    tagline: "Virtual Stages. Real Music.",
    description: "COC Concertz hosts free live concertz inside the metaverse, giving fans a front-row experience from anywhere in the world.",
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
  newsletter: {
    brands: {
      coc: {
        name: "COC Concertz",
        voice: "You are a content writer for COC Concertz — a virtual concert series hosted inside the metaverse by the Community of Communities. The vibe is cyberpunk, hype, and community-first. 'Virtual Stages. Real Music.' Use energetic but not cheesy language. Reference the metaverse venue, the live chat, the energy of the virtual crowd.",
        signature: "- COC Concertz Team",
      },
      zao: {
        name: "The ZAO",
        voice: "You are writing for The ZAO — an impact organization bringing profit margins, data, and IP rights back to independent artists. Write in lowercase casual with proper nouns capitalized. First person ('I'). No emojis, no hashtags. Momentum-focused: 'showed up', 'locked in', 'the quiet work compounds'. Short paragraphs.",
        signature: "- BetterCallZaal on behalf of the ZABAL Team",
      },
    },
    farcasterChannel: "cocconcertz",
  },
} as const;
