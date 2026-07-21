"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, Input, Button } from "@/components/ui";

// Show Night panel - battle control + push notifications from the admin
// dashboard, so shows run without a terminal. Backends:
// /api/admin/battle (mirrors scripts/manage-battle.ts)
// /api/admin/notify (mirrors scripts/send-notification.ts)

interface LiveBattle {
  id: string;
  title: string;
  sideA: string;
  sideB: string;
  votesA: number;
  votesB: number;
}

const label: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "var(--cyan)",
  marginBottom: "12px",
};

const statusLine: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "var(--text-dim)",
  marginTop: "10px",
};

export function ShowNightPanel() {
  // Battle state
  const [live, setLive] = useState<LiveBattle | null>(null);
  const [title, setTitle] = useState("");
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [battleBusy, setBattleBusy] = useState(false);
  const [battleStatus, setBattleStatus] = useState<string | null>(null);

  // Notify state
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifId, setNotifId] = useState(() => `coc-${Date.now()}`);
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  const refreshBattle = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/battle");
      if (!res.ok) return;
      const data = await res.json();
      setLive(data.live);
    } catch {
      // leave state as-is
    }
  }, []);

  useEffect(() => {
    refreshBattle();
    const t = setInterval(refreshBattle, 10000);
    fetch("/api/admin/notify")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setTokenCount(d.enabledTokens))
      .catch(() => {});
    return () => clearInterval(t);
  }, [refreshBattle]);

  const createBattle = async () => {
    if (battleBusy) return;
    setBattleBusy(true);
    setBattleStatus(null);
    try {
      const res = await fetch("/api/admin/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", title, sideA, sideB }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setBattleStatus("Battle is LIVE on the homepage.");
      setTitle("");
      setSideA("");
      setSideB("");
      await refreshBattle();
    } catch (err) {
      setBattleStatus(err instanceof Error ? err.message : "Failed to create battle.");
    } finally {
      setBattleBusy(false);
    }
  };

  const closeBattle = async () => {
    if (battleBusy) return;
    setBattleBusy(true);
    setBattleStatus(null);
    try {
      const res = await fetch("/api/admin/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const r = data.results?.[0];
      setBattleStatus(
        r
          ? `Closed: ${r.votesA} - ${r.votesB}. Winner: ${r.winnerName}`
          : "No live battle to close."
      );
      await refreshBattle();
    } catch (err) {
      setBattleStatus(err instanceof Error ? err.message : "Failed to close battle.");
    } finally {
      setBattleBusy(false);
    }
  };

  const sendPush = async () => {
    if (notifBusy) return;
    setNotifBusy(true);
    setNotifStatus(null);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: notifId,
          title: notifTitle,
          message: notifBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setNotifStatus(
        `Sent ${data.sent}, invalid ${data.invalid}, rate-limited ${data.rateLimited}.`
      );
    } catch (err) {
      setNotifStatus(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setNotifBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
      {/* Battle control */}
      <Card>
        <div style={label}>Live Battle Vote</div>

        {live ? (
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "6px",
                color: "var(--yellow)",
              }}
            >
              LIVE: {live.title}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", marginBottom: "14px" }}>
              {live.sideA} {live.votesA} - {live.votesB} {live.sideB}
            </div>
            <Button variant="primary" onClick={closeBattle} disabled={battleBusy}>
              {battleBusy ? "Working..." : "END BATTLE + TALLY"}
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Input label="Battle Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="English vs Spanish" />
            <div style={{ display: "flex", gap: "10px" }}>
              <Input label="Side A" value={sideA} onChange={(e) => setSideA(e.target.value)} placeholder="Team English" />
              <Input label="Side B" value={sideB} onChange={(e) => setSideB(e.target.value)} placeholder="Team Spanish" />
            </div>
            <Button
              variant="primary"
              onClick={createBattle}
              disabled={battleBusy || !title.trim() || !sideA.trim() || !sideB.trim()}
            >
              {battleBusy ? "Working..." : "GO LIVE WITH BATTLE"}
            </Button>
          </div>
        )}

        {battleStatus && <div style={statusLine}>{battleStatus}</div>}
      </Card>

      {/* Push notifications */}
      <Card>
        <div style={label}>
          Push Notification{tokenCount !== null ? ` (${tokenCount} subscribed)` : ""}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input
            label="Send ID (auto-generated; reruns within 24h dedupe)"
            value={notifId}
            onChange={(e) => setNotifId(e.target.value)}
            placeholder="coc-1752964537000"
          />
          <Input
            label={`Title (${notifTitle.length}/32)`}
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            placeholder="COC #7 is LIVE"
          />
          <Input
            label={`Message (${notifBody.length}/128)`}
            value={notifBody}
            onChange={(e) => setNotifBody(e.target.value)}
            placeholder="WaveWarZ Takeover starts now. DJ Zaal on the decks."
          />
          <Button
            variant="primary"
            onClick={sendPush}
            disabled={
              notifBusy ||
              !notifId.trim() ||
              !notifTitle.trim() ||
              !notifBody.trim() ||
              notifTitle.length > 32 ||
              notifBody.length > 128
            }
          >
            {notifBusy ? "Sending..." : "SEND TO ALL SUBSCRIBERS"}
          </Button>
        </div>
        {notifStatus && <div style={statusLine}>{notifStatus}</div>}
      </Card>
    </div>
  );
}
