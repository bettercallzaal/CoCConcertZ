# COC #7 Post-Show Social Drafts

Use these after the show ends (Saturday July 19, 2026).
Fill in the [BRACKET] values from the pilot report (Saturday morning).
All posting is Zaal-gated — copy-paste each where needed.

---

## Post 1: Show Recap (Farcaster/X — post within 2h of show end)

**Farcaster (320-char, ZM opener):**

```
ZM. COC Concertz #7 just wrapped.

[PEAK_VIEWERS] people were in the room. [BATTLE_COUNT] WaveWarZ battles — [WINNER_NAME] walked away with the crown.

First show with no wallet gate. Open to anyone.

Archive is live on Arweave. cocconcertz.com/archive
```

**X (280-char version):**

```
COC Concertz #7 wrapped. [PEAK_VIEWERS] live. [BATTLE_COUNT] WaveWarZ battles. [WINNER_NAME] won.

First open-access show — no wallet required.

Full archive: cocconcertz.com/archive
```

---

## Post 2: Pilot Numbers (Farcaster — post Saturday after running pilot report)

```
COC #7 open-access pilot results:

[PEAK_VIEWERS] peak viewers
[GALLERY_UPLOADS] fan gallery uploads
[ARCHIVE_UPLOADS] archive uploads (all gateless, no wallet needed)
[BATTLE_VOTES] total WaveWarZ battle votes

Wallet gate dropped, numbers up. We are doing this again.
```

---

## Post 3: Arweave Archive Announcement (post when archive upload confirmed)

**Farcaster /cocconcertz channel:**

```
COC #7 is on Arweave.

Every set. Every battle. Permanent.
[ARWEAVE_TX_ID]

View it: cocconcertz.com/archive
```

**X:**

```
COC Concertz #7 is permanently archived on Arweave.

Every set. Every WaveWarZ battle.
[ARWEAVE_TX_ID]

Archive: cocconcertz.com/archive
```

---

## Post 4: Artist Shoutout (Farcaster — tag each artist, post same day)

```
ZM. Shoutout to tonight's COC #7 lineup:

[ARTIST_1_HANDLE] — [ARTIST_1_SET_DESCRIPTION]
[ARTIST_2_HANDLE] — [ARTIST_2_SET_DESCRIPTION]
[ARTIST_3_HANDLE] — [ARTIST_3_SET_DESCRIPTION]

WaveWarZ winner: [WINNER_NAME_HANDLE]

COC Concertz #8 → August. Stay tuned.
```

---

## Post 5: WaveWarZ Battle Winner Announcement (Farcaster /wavewarz channel)

```
WaveWarZ Takeover results from COC #7:

[BATTLE_1_TITLE]: [BATTLE_1_WINNER] def. [BATTLE_1_LOSER] ([BATTLE_1_VOTES_A] vs [BATTLE_1_VOTES_B] votes)
[BATTLE_2_TITLE]: [BATTLE_2_WINNER] def. [BATTLE_2_LOSER]
...

Finals winner: [WINNER_NAME]

[PEAK_VIEWERS] in the crowd. Full archive: cocconcertz.com/archive
```

---

## Post 6: COC #8 Teaser (post Monday July 21 — 1 day after pilot results)

```
COC Concertz #7 showed us something.

[PEAK_VIEWERS] people came through with no wallet required.

COC #8 is happening. No gate. Real music. Date TBA — follow @cocconcertz for the drop.
```

---

## Bracket Reference

| Bracket | Source | Where to get it |
|---------|--------|-----------------|
| [PEAK_VIEWERS] | Manual screenshot from runbook (T+0, T+1h, T+2h) | Take highest from your show-night notes |
| [BATTLE_COUNT] | `npx tsx scripts/manage-battle.ts status` | Firestore battles collection |
| [WINNER_NAME] | Battle final result | Firestore battles → last closed battle |
| [WINNER_NAME_HANDLE] | Artist's Farcaster handle | From artist profile or COC artist doc |
| [GALLERY_UPLOADS] | `/api/metrics/coc7` → `fanGalleryUploads` | Run curl after show |
| [ARCHIVE_UPLOADS] | `/api/metrics/coc7` → `archiveUploads.total` | Run curl after show |
| [BATTLE_VOTES] | Sum votesA + votesB across all battles | From Firestore battles docs |
| [ARWEAVE_TX_ID] | Upload output from `npx tsx scripts/update-coc7.ts` | Run after show |
| [ARTIST_*] | From show lineup / PR #32 artist setup | cocconcertz.com/artists |
