# WaveWarZ Brief - COC Concertz #7 Show Prep

Compiled 2026-07-04 from the ZAO research library (docs 099/101/180/421/608/711/743/805/854),
wwbase + wwtracker + ZAOscout repos, live scrapes of wavewarz.com + wavewarz-intelligence,
the Bonfire knowledge graph, and the cowork tracker. For the July 18 WaveWarZ Takeover.

## What WaveWarZ is (one paragraph)

Live-traded music battles: two songs go head to head, fans buy speculative positions
in each side (SOL on Solana today, ephemeral ERC-20s on Base next), and the chart
decides the winner. Artists earn 1% of every trade instantly; winners take 40% of the
loser pool + 5% bonus, losers get a 50% refund; 98.5% of value stays in the ecosystem.
Parimutuel model, so the pool ratio doubles as a live odds signal. Founded and run by
Ikechi "Hurric4n3Ike" Nwachukwu (dev/MC) + Samantha "candytoybox" Denton-Kinney
(app stack/ops), with Zaal as Director of Ecosystem Strategy & Partnerships.

## The numbers that matter (for announcements and stage patter)

- 958+ battles, 484+ SOL total volume (Jun 15 snapshot; our baked site snapshot: 416 battles / 88 SOL because pagination misses recent months - see Data Ops below)
- 11 shows/week cadence: 5 morning + 5 night Mon-Fri, plus Sunday
- Battle formats: Main Events (20+ min, triple judging: human judge + X poll + SOL vote, 2-of-3), Quick Battles (6-9 min, chart decides), Community Battles (custom rules - the COC format)
- Artist payouts to date: 8.66+ SOL streamed straight to musicians
- Biggest single battle in our data: 9.07 SOL volume (Jun 7)

## COC alumni ARE WaveWarZ fighters - the crew story

| Artist | COC history | WaveWarZ record |
|--------|------------|-----------------|
| GodclouD | COC #5 headliner | 32 battles, 75% win rate (highest of the actives), 8.33 SOL |
| dopestilo (Stilo World) | Venue host, COC #2/#3/#4/#5 | 59 battles, 61% win rate; STILO English ran 14.46 SOL over just 9 battles |
| CannonJones973 (Taji) | ZAO Cards lead, ZABAL mentor | 60 battles, 56.7% win rate, highest earnings at 12.49 SOL |
| luiwrites (LUI) | - | Most active: 92 battles, 58.7%, 7.12 SOL |
| Hurric4n3Ike | Founder | 60W-18L across 3 wallets |

Lineup implication: the "WaveWarZ artists" for July 18 can be pitched as returning
COC family (GodclouD, Stilo) + WaveWarZ natives (LUI, Cannon, Ike himself). Announce
week-of per plan.

## Show-night format (what the research says works)

- COC #2 and #3 both ran the English vs Spanish community battle format - proven in
  this exact venue
- Our BattleVote widget = the free, no-wallet layer of the same mechanic (crowd picks
  the winner, bar moves live). Real SOL trading stays on wavewarz.com - link out, do
  not replicate (doc 421: reject copytrading UX, keep reasoning/community first)
- Triple-judging pattern for a headline battle: DJ Zaal as human judge + an X poll +
  the BattleVote tally = a COC-flavored 2-of-3, zero new code
- Doc 854's 24h protocol: a ~23h open entry queue closing in a ~10-min live battle -
  COC #7 could be the public demo of that rhythm (open the BattleVote days early as
  "pre-vote", settle live on stream)

## Strategic context (why this show matters beyond the show)

1. Base mainnet is imminent: contracts live on Base Sepolia since Feb 27 (134/135
   Foundry tests), pending Arthur (Neynar) security review. Tracker has a P1 "ship
   date + ORDAO Respect" decision due July 10 - EIGHT DAYS before the show. If Base
   mainnet lands first, COC #7 is the launch party narrative.
2. Agentic future: x402 agent betting, AI Artist Tournament (8-16 slots), agents
   funding + trading autonomously. "A protocol people can build on top of" is the
   Zaal quote in doc 711 - COC #7 is the proof case for events as a vertical.
3. Global expansion running in parallel: WaveWarZ Africa live (Ram/SongChain, Zambia -
   note Iman Afrikah of COC #6 is the same scene), India scoping (Arun Phillips +
   Universal-partnered indie collective). COC #7 sits in a "WaveWarZ everywhere"
   month.
4. TestFlight synergy: research doc 966 (Expo to TestFlight: WaveWarZ playbook) is in
   Zaal's review queue - same motion as the COC Capacitor app (docs/testflight-runbook.md).

## Data ops (our tooling)

- `scripts/fetch-wavewarz-history.ts` bakes the homepage snapshot. KNOWN GAP: the
  /battles pagination is sparse after early May, so recent battles undercount. Re-run
  before the show for freshest page-1 data; treat totals as floors ("415+").
- ZAOscout has a second module we are not using yet: `src/wavewarz.ts` parses
  per-artist stats pages (wavewarz-intelligence/artist/{wallet}) with validated
  financials - could power per-artist cards for the announced crew.
- Surfaces: wavewarz.com (product), wavewarz-intelligence.vercel.app (leaderboards +
  artist pages), analytics-wave-warz.vercel.app (volume charts), discord.wavewars.info.

## Open blockers relevant to the show

| Blocker | Owner | Why it matters for July 18 |
|---------|-------|---------------------------|
| Base mainnet review sign-off | Arthur + Ike | Launch-party narrative window |
| P1 ship date + ORDAO Respect decision (due Jul 10) | Sam + Arthur + Zaal | Same day as contest deadline |
| Crew lineup confirmation (week of show) | Zaal + Ike | Alumni-battler story above is ready to go |
| Cloudinary key fix | Zaal | Contest entries blocked NOW |
| #5/#6 recap footage upload | Zaal | WaveWarZ history section links out; recaps thin |

## Sources

ZAO research library: docs 099 (parimutuel design), 100 (Solana PDA reads), 101
(integration whitepaper, superseded), 180 (artist discovery pipeline), 421 (Quotient
anti-copytrading design), 608 (Africa launch), 711 (Arthur Base review call), 743
(whitepaper v2 deep dive - canonical), 805 (India/Arun), 854 (24h protocol), 966
(Expo TestFlight playbook, in review). Repos: CandyToyBox/wavewarz-base,
wavewarz-intelligence; bettercallzaal/wwtracker, wavewarzapp, ZAOscout. Live scrapes
2026-07-04. Bonfire knowledge graph + cowork tracker queries 2026-07-04.
