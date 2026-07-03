# Recap Video Pipeline (spacetovideo)

Post-show branded recap videos via the spacetovideo repo
(github.com/bettercallzaal/spacetovideo): Deepgram transcription with speaker
detection, artist cards with PFPs, rolling captions, waveform, 1920x1080 render
via Remotion.

## One-time setup

1. Clone spacetovideo locally, `npm install`
2. Keys in its `.env`: `DEEPGRAM_API_KEY` (Nova-3), `NEYNAR_API_KEY` (PFP lookup)
3. COC rebrand (one-time fork or branch):
   - `src/compositions/SpaceRecap.tsx` - swap title card to "COC Concertz", subtitle per show
   - Palette: gold #FFD600, cyan #00F0FF, black #050505 (matches concertz.config.ts)
   - `scripts/lib/intro-patterns.ts` - add concert patterns: "next up we have", "on the decks", "give it up for"

## Per-show run (COC #7 example)

1. Export show audio (Twitch VOD audio or Spatial recording) as `public/audio.ogg`
2. `npm run transcribe` - 5-10 min for a 2 hr show. Add keyterms: "DJ Zaal", "WaveWarZ", artist names
3. `npm run intros` - auto-detects artist intros, slices 15-sec samples; listen and confirm handles in `data/intros.json` (~30 min)
4. `npm run pfps && npm run waveform`
5. `npm run render SpaceRecap out/coc7-recap.mp4` - 3-6 hrs on an M-series Mac (run overnight)
6. Upload to YouTube, add to VideoHighlights.tsx, embed in event recap, share via `scripts/generate-socials.ts`

## Status

- [ ] Deepgram API key provisioned
- [ ] COC-branded fork of SpaceRecap composition
- [ ] Test run on a past show (COC #5 or #6 audio) before July 18
