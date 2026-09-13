import { describe, expect, it } from "vitest";
import { PAST_SHOW_VIDEOS } from "../../../scripts/lib/past-show-videos";

describe("PAST_SHOW_VIDEOS", () => {
  const all = Object.entries(PAST_SHOW_VIDEOS).flatMap(([show, videos]) =>
    videos.map((v) => ({ show, ...v }))
  );

  it("has videos for shows 1-6", () => {
    expect(Object.keys(PAST_SHOW_VIDEOS).map(Number)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("uses well-formed YouTube ids", () => {
    for (const v of all) expect(v.youtubeId, `#${v.show} ${v.title}`).toMatch(/^[A-Za-z0-9_-]{11}$/);
  });

  // The list this replaced had a #1 video under #2 and a #4 video under #3.
  it("never files the same video under two slots", () => {
    const seen = new Map<string, string>();
    for (const v of all) {
      const where = `#${v.show} ${v.artist ?? ""} ${v.title}`;
      expect(seen.get(v.youtubeId), `${v.youtubeId} at ${where}`).toBeUndefined();
      seen.set(v.youtubeId, where);
    }
  });
});
