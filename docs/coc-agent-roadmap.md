# COC Agent Roadmap

Path from "Zaal pastes everything" to an autonomous COC show-ops agent.
Prepared 2026-07-03. Research grounding: ZAOOS doc 960 (attendance growth
playbook - loops beat launches; the agent's job is running the loops).

## Stage 0 - today (done)

- `.claude/agents/coc-ops.md` - any Claude Code session in this repo can spawn
  a COC-aware ops agent for rollovers, contest ops, battle control, drafts.
- All ops are scripted and credential-light: `vercel env pull` + npx tsx scripts/*.
- Drafts flow through clipboard pages; Zaal posts by hand.

## Stage 1 - scheduled ops (no new creds)

Cloud-scheduled Claude runs (via /schedule) or local cron ticks that:
- Refresh WaveWarZ history JSON weekly (PR)
- Contest watch: daily count of new contestEntries, flag spam/off-brand uploads
- T-minus cadence: at T-7/T-3/T-1 days generate the socials pack + clipboard it
- Post-show: prompt the recap checklist, draft recap socials

Everything still lands as drafts + PRs. Zero posting credentials required.

## Stage 2 - notifications (build next, before Jul 18)

Mini app push notifications - the highest-leverage capability from doc 960
(40% open rates network-wide; social triggers beat calendar reminders):
- Webhook endpoint for `miniapp_add` / notification-token events (or Neynar
  managed webhooks), tokens in Firestore `notificationTokens`
- Sends: show-day ("doors in 1 hour"), battle-live ("crowd is deciding NOW"),
  contest deadline ("48h left to submit")
- Rate limits: 1/30s/token, 100/day/token, stable notificationId dedupe
- This is the agent's first OWNED outbound channel - notifications are
  app-surface, not identity-surface, so no impersonation risk

## Stage 3 - posting hands (needs Zaal's sign-off per surface)

The ZAO fleet already has patterns for this (ZOL posts as Zaal on X):
- Farcaster: signer for the COC account (FID 19640) -> agent casts to
  /cocconcertz directly. Neynar signer or Warpcast API key
- Telegram: bot added to the COC group -> agent posts the packs it drafts
- X: reuse the ZOL posting rail with a COC template
- Guardrail: agent posts only content types Zaal has pre-approved (show
  announcements, contest reminders, recap drops); anything novel stays a draft

## Stage 4 - full show-cycle autonomy

One agent runs the loop end to end: rollover PR after each show, contest
round open/close, T-minus social cadence, show-night battle control from a
runbook, post-show recap + clips + badge issuance. Zaal's remaining jobs:
lineup decisions, winner picks, and being the DJ.

## Decision needed from Zaal

1. Stage 1 cadence: cloud /schedule (survives laptop close) or session loops?
2. Stage 3 surfaces in order of comfort: Telegram bot first? Farcaster signer?
3. Where the agent lives long-term: this repo's runbooks driven by Claude Code,
   or a ZAO OS fleet member (hermes-orchestrator pattern) with COC as its beat?
