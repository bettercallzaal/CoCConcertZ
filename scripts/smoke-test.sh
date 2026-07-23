#!/usr/bin/env bash
# Production smoke test for cocconcertz.com - run before every show and after
# every deploy. Codifies the 2026-07-03 QA pass. No credentials needed.
#
# Usage: bash scripts/smoke-test.sh [base-url]
set -u

BASE="${1:-https://www.cocconcertz.com}"
PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $name (expected $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

code() { curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$@"; }

echo "Smoke test: $BASE"
echo "---"

# Pages
check "homepage 200" 200 "$(code "$BASE")"
check "/contest 200" 200 "$(code "$BASE/contest")"
check "/brand 200" 200 "$(code "$BASE/brand")"

# Homepage content
HOMEPAGE=$(curl -s --max-time 30 "$BASE")
check "homepage has COC Concertz branding" 1 "$(echo "$HOMEPAGE" | grep -c "COC Concertz" | awk '{print ($1>0)?1:0}')"
check "homepage has JSON-LD" 1 "$(echo "$HOMEPAGE" | grep -c "application/ld+json" | awk '{print ($1>0)?1:0}')"
check "homepage has battle history section" 1 "$(echo "$HOMEPAGE" | grep -c "BATTLE HISTORY" | awk '{print ($1>0)?1:0}')"

# OG cards
check "og/contest is png" "200 image/png" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' --max-time 30 "$BASE/api/og/contest")"
check "og/countdown is png" "200 image/png" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' --max-time 30 "$BASE/api/og/countdown")"

# SEO surfaces
check "sitemap lists /contest" 1 "$(curl -s --max-time 30 "$BASE/sitemap.xml" | grep -c "/contest" | awk '{print ($1>0)?1:0}')"
check "robots.txt 200" 200 "$(code "$BASE/robots.txt")"

# Farcaster manifest
MANIFEST=$(curl -sL --max-time 30 "$BASE/.well-known/farcaster.json")
check "manifest has webhookUrl" 1 "$(echo "$MANIFEST" | grep -c webhookUrl | awk '{print ($1>0)?1:0}')"
check "manifest has accountAssociation" 1 "$(echo "$MANIFEST" | grep -c accountAssociation | awk '{print ($1>0)?1:0}')"

# Webhook auth
check "webhook rejects empty envelope" 400 "$(code -X POST "$BASE/api/webhook/farcaster" -H 'Content-Type: application/json' -d '{}')"
FORGED='{"header":"eyJmaWQiOjEsInR5cGUiOiJhcHBfa2V5Iiwia2V5IjoiMHhhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYiJ9","payload":"eyJldmVudCI6Im1pbmlhcHBfYWRkZWQifQ","signature":"YWJjZA"}'
check "webhook rejects forged signature" 401 "$(code -X POST "$BASE/api/webhook/farcaster" -H 'Content-Type: application/json' -d "$FORGED")"

# Admin auth walls
check "admin/battle unauth 401" 401 "$(code "$BASE/api/admin/battle")"
check "admin/notify unauth 401" 401 "$(code -X POST "$BASE/api/admin/notify" -H 'Content-Type: application/json' -d '{}')"

# Upload path (the 2026-07-03 outage: Cloudinary key permissions)
TMPIMG=$(mktemp /tmp/coc-smoke-XXXXXX.png)
# 1x1 transparent png
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xa75\x81\x84\x00\x00\x00\x00IEND\xaeB\x60\x82' > "$TMPIMG"
UPLOAD_CODE=$(code -X POST "$BASE/api/upload" -F "file=@$TMPIMG;type=image/png" -F "folder=coc-concertz/smoke-test")
rm -f "$TMPIMG"
check "upload API healthy" 200 "$UPLOAD_CODE"

# COC #7 historical metrics endpoint (stays live post-show)
check "metrics/coc7 200" 200 "$(code "$BASE/api/metrics/coc7")"

# COC #8 metrics endpoint (added in PR #59 — checks existence + shape)
METRICS8=$(curl -s --max-time 30 "$BASE/api/metrics/coc8")
check "metrics/coc8 200" 200 "$(code "$BASE/api/metrics/coc8")"
check "metrics/coc8 has concurrentViewers" 1 "$(echo "$METRICS8" | grep -c '"concurrentViewers"' | awk '{print ($1>0)?1:0}')"
check "metrics/coc8 has archiveUploads" 1 "$(echo "$METRICS8" | grep -c '"archiveUploads"' | awk '{print ($1>0)?1:0}')"
check "metrics/coc8 has peakViewers" 1 "$(echo "$METRICS8" | grep -c '"peakViewers"' | awk '{print ($1>0)?1:0}')"
# Pilot gate canary for COC #8: NEXT_PUBLIC_WALLET_GATE_ENABLED must be false before the show.
# This check WILL FAIL until Zaal sets the env var in Vercel + redeploys.
GATE8=$(echo "$METRICS8" | grep -o '"walletGateEnabled":[^,}]*' | grep -o '[^:]*$' | tr -d ' ')
check "pilot gate is OFF for COC #8 (walletGateEnabled=false)" "false" "$GATE8"

echo "---"
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
