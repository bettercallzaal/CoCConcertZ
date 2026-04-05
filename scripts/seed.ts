import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

const events = [
  {
    name: "+COC CONCERTZ #1",
    number: 1,
    date: new Date("2025-03-29T20:00:00Z"),
    description: "The first-ever COC Concertz metaverse show.",
    rsvpLink: "",
    venue: { spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349" },
    status: "completed",
    artists: [],
    flyerUrl: "",
    bannerUrl: "",
  },
  {
    name: "+COC CONCERTZ #2",
    number: 2,
    date: new Date("2025-10-11T20:00:00Z"),
    description: "Second installment — bigger crowd, bigger sound.",
    rsvpLink: "",
    venue: { spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349" },
    status: "completed",
    flyerUrl: "/images/concertz2-flyer.jpg",
    bannerUrl: "",
    artists: [],
  },
  {
    name: "+COC CONCERTZ #3",
    number: 3,
    date: new Date("2026-03-07T21:15:00Z"),
    description: "Web3 metaverse music experience in StiloWorld.",
    rsvpLink: "",
    venue: { spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349" },
    status: "completed",
    flyerUrl: "/images/concertz3-flyer.jpeg",
    bannerUrl: "",
    artists: [],
  },
  {
    name: "+COC CONCERTZ #4",
    number: 4,
    date: new Date("2026-04-11T20:00:00Z"),
    description: "Live in StiloWorld — Joseph Goats, Stilo, Tom Fellenz.",
    rsvpLink: "https://luma.com/0ksej24k",
    venue: { spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349", streamLink: "https://twitch.tv/bettercallzaal" },
    status: "upcoming",
    flyerUrl: "/images/coc4.1.jpg",
    bannerUrl: "/images/coc4.jpg",
    artists: [],
  },
  {
    name: "+COC CONCERTZ #5",
    number: 5,
    date: new Date("2026-05-09T20:00:00Z"),
    description: "Next metaverse concert — don't miss it.",
    rsvpLink: "https://luma.com/dwrdi3gg",
    venue: { spatialLink: "https://www.spatial.io/s/STILO-WORLD-DESIGN-BY-CYBERNERDBABY-63c48d8dbacec9c570e6acbb?share=1395970456673833349" },
    status: "upcoming",
    flyerUrl: "",
    bannerUrl: "",
    artists: [],
  },
];

async function seed() {
  console.log("Seeding events...");
  for (const event of events) {
    const ref = db.collection("events").doc();
    await ref.set({ ...event, createdAt: new Date(), updatedAt: new Date() });
    console.log(`  Created: ${event.name} (${ref.id})`);
  }
  console.log("\nDone! Seed complete.");
}

seed().catch(console.error);
