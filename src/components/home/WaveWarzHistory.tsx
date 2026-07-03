import history from "@/data/wavewarz-history.json";

// WaveWarZ battle history - baked snapshot from scripts/fetch-wavewarz-history.ts
// (scraper pattern from ZAOscout, stat-tile pattern from wwtracker).
// Snapshot is page-capped, so totals are floors - hence the "+".

interface RecentBattle {
  battleId: number;
  date: string | null;
  song1Title: string | null;
  song2Title: string | null;
  song1Handle: string | null;
  song2Handle: string | null;
  winnerTitle: string | null;
  totalVolumeSol: number | null;
  marginPct: number | null;
}

const tileStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--card)",
  padding: "20px 18px",
  flex: 1,
  minWidth: 160,
};

const tileLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "var(--text-dim)",
  marginBottom: "8px",
};

const tileValue: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "32px",
  color: "var(--yellow)",
  lineHeight: 1,
};

export default function WaveWarzHistory() {
  const recent = (history.recent as RecentBattle[]).slice(0, 6);

  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">The Format</span>
      <h2>WAVEWARZ BATTLE HISTORY</h2>
      <p style={{ maxWidth: 640, marginBottom: "32px" }}>
        WaveWarZ runs live music battles where the crowd decides the winner -
        production-proven on Solana with hundreds of battles behind it. COC #7
        brings that format into Stilo World.
      </p>

      {/* Stat tiles - wwtracker pattern */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "36px" }}>
        <div className="clip-corner" style={tileStyle}>
          <div style={tileLabel}>Battles Run</div>
          <div style={tileValue}>{history.totalBattles}+</div>
        </div>
        <div className="clip-corner" style={tileStyle}>
          <div style={tileLabel}>Volume Traded</div>
          <div style={tileValue}>{history.totalVolumeSol}+ SOL</div>
        </div>
        <div className="clip-corner" style={tileStyle}>
          <div style={tileLabel}>Next Battleground</div>
          <div style={{ ...tileValue, color: "var(--cyan)", fontSize: "24px", paddingTop: "5px" }}>
            STILO WORLD
          </div>
        </div>
      </div>

      {/* Recent battles */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              {["Date", "Matchup", "Winner", "Margin"].map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "var(--text-dim)",
                    textAlign: "left",
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((b) => (
              <tr key={b.battleId}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", padding: "10px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                  {b.date ?? "-"}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  {b.song1Title ?? "?"} <span style={{ color: "var(--cyan)" }}>vs</span> {b.song2Title ?? "?"}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--yellow)", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  {b.winnerTitle ?? "-"}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                  {b.marginPct !== null ? `${b.marginPct.toFixed(1)}%` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "16px" }}>
        <a
          href="https://wavewarz.com"
          target="_blank"
          rel="noopener"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--cyan)",
          }}
        >
          Full battle arena at wavewarz.com
        </a>
      </div>
    </section>
  );
}
