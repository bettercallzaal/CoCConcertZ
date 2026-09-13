/**
 * The YouTube videos for each past COC Concertz show, in running order.
 *
 * One list, read by both scripts/seed-past-events.ts and
 * scripts/patch-past-show-videos.ts, so a correction cannot reach one and
 * not the other.
 *
 * Every id and title here was checked against the video's own YouTube title
 * (yt-dlp over The ZAO's COC Concertz playlist, @thezaodao/videos and
 * @bettercallzaal/streams, 2026-09-13). The list this replaced had shifted
 * labels on #1-#4, a #1 video filed under #2, and a #4 video filed under #3.
 * If you add a video, check its YouTube title first.
 */
import type { RecapVideo } from "../../src/lib/types";

export const PAST_SHOW_VIDEOS: Record<number, RecapVideo[]> = {
  1: [
    { title: "Metaverse Memories (Thyrevolution Edit)", youtubeId: "RpNjGxUMMjk", artist: "AttaBotty" },
    { title: "Intro", youtubeId: "-ggYAdu4KRE", artist: "AttaBotty" },
    { title: "Song 1: Flyin", youtubeId: "E0xE65RRKI0", artist: "AttaBotty" },
    { title: "Song 2: Altered Pathways", youtubeId: "v_Vhbx9exgo", artist: "AttaBotty" },
    { title: "More Lore and Background", youtubeId: "x-EQv0wdiOA", artist: "AttaBotty" },
    { title: "Song 3: Stay Based", youtubeId: "lyyx-jEY94k", artist: "AttaBotty" },
    { title: "Song 4: Eternal Rhythms #3", youtubeId: "aNPEq5UslMU", artist: "AttaBotty" },
    { title: "Song 5: Eternal Rhythms #4", youtubeId: "rbKY61E2SqM", artist: "AttaBotty" },
    { title: "Song 6: Eternal Rhythms #5", youtubeId: "JO4gwfHX1RI", artist: "AttaBotty" },
    { title: "Song 7 and Outro", youtubeId: "rFKN-WobG9Y", artist: "AttaBotty" },
    { title: "Intro", youtubeId: "4n1dFs5T4T4", artist: "Clejan" },
    { title: "Song 1: Let's Go", youtubeId: "M04SiX3stEE", artist: "Clejan" },
    { title: "Song 2: Drive Fast", youtubeId: "rwSbB9JTZx0", artist: "Clejan" },
    { title: "Song 3: My Favorite Strings", youtubeId: "7BSUzE2LM64", artist: "Clejan" },
    { title: "Song 4: Gummy", youtubeId: "gyj0Nvcy0Lo", artist: "Clejan" },
    { title: "Song 5: Sepira", youtubeId: "SuJrihWBO6I", artist: "Clejan" },
    { title: "Song 6: Look at Me Now", youtubeId: "w-q9ZY5GnnY", artist: "Clejan" },
    { title: "Song 7: Dance with the Devil", youtubeId: "dqOA3HpjgAY", artist: "Clejan" },
    { title: "Song 8: Candy", youtubeId: "oonC8uKBaMo", artist: "Clejan" },
    { title: "Song 9: I Did It", youtubeId: "gYqud1Dbzog", artist: "Clejan" },
    { title: "Song 10: Shakedown", youtubeId: "JTy_guyHfrA", artist: "Clejan" },
    { title: "Song 11: Lolipop", youtubeId: "65lclQWx24A", artist: "Clejan" },
    { title: "Song 12: Run It Up", youtubeId: "vajSBpNjmj4", artist: "Clejan" },
    { title: "Song 13: She Likes the Way That I Fiddle", youtubeId: "0MIJ0YSVe5s", artist: "Clejan" },
  ],
  2: [
    { title: "Intro", youtubeId: "TTflDDtpXkg", artist: "COC Concertz #2" },
    { title: "Live Performance", youtubeId: "zYm3g_YUYjE", artist: "Tom Fellenz" },
    { title: "WaveWarZ Battle", youtubeId: "-nx9gZtK8ug", artist: "Stilo World" },
    { title: "Live Performance", youtubeId: "YYyBFasvkuM", artist: "AttaBotty" },
  ],
  3: [
    { title: "Intro", youtubeId: "Toa4hnkn54E", artist: "COC Concertz #3" },
    { title: "Live Performance", youtubeId: "YGRkJSGrgNg", artist: "Dúo Dø Musica" },
    { title: "Live Performance", youtubeId: "XNZC0B-97dU", artist: "Joseph Goats" },
    { title: "Stilo vs Stilo - Live WaveWarZ Battle", youtubeId: "WkuDVtZSYaE", artist: "Stilo World" },
    { title: "Community Reflections and Closing Jam", youtubeId: "LF7qcZnF7XY", artist: "COC Concertz #3" },
    { title: "Outro", youtubeId: "lqFhoBl2jHo", artist: "COC Concertz #3" },
  ],
  4: [
    { title: "Full Show", youtubeId: "oqdxFclvOdg", artist: "COC Concertz #4" },
    { title: "Intro", youtubeId: "-SOwQ5xR714", artist: "COC Concertz #4" },
    { title: "Live Performance", youtubeId: "uvURHoFXoVs", artist: "Joseph Goats" },
    { title: "Live Performance", youtubeId: "iwkDtZHuQPE", artist: "Tom Fellenz" },
    { title: "Live Performance", youtubeId: "gGAQ_tkBMpQ", artist: "Stilo World" },
  ],
  5: [{ title: "Full Show", youtubeId: "iO0U5-kwIQ8", artist: "COC Concertz #5" }],
  6: [{ title: "Full Show", youtubeId: "T77-2JWhfCY", artist: "COC Concertz #6" }],
};
