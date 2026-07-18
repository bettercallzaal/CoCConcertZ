import type { MetadataRoute } from "next";
import { getArtistsServer, getEventsServer } from "@/lib/db-server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artists, events] = await Promise.all([
    getArtistsServer(),
    getEventsServer(),
  ]);

  const artistUrls: MetadataRoute.Sitemap = artists.map((a) => ({
    url: `https://cocconcertz.com/artists/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const eventUrls: MetadataRoute.Sitemap = events.map((e) => ({
    url: `https://cocconcertz.com/events/${e.number}`,
    lastModified: e.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://cocconcertz.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://cocconcertz.com/contest",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://cocconcertz.com/archive",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://cocconcertz.com/artists",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://cocconcertz.com/newsletter",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://cocconcertz.com/brand",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...artistUrls,
    ...eventUrls,
  ];
}
