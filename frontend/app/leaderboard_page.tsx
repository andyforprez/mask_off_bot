"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  poker_nickname: string;
  display_name: string;
  username: string | null;
  total_points: number;
  total_knockouts: number;
  tournaments_played: number;
  best_finish: number | null;
}

const RANK_STYLES: Record<number, { color: string; icon: string; glow: string }> = {
  1: { color: "#ffd700", icon: "♛", glow: "0 0 20px rgba(255,215,0,0.4)" },
  2: { color: "#c0c0c0", icon: "♛", glow: "0 0 12px rgba(192,192,192,0.3)" },
  3: { color: "#cd7f32", icon: "♛", glow: "0 0 12px rgba(205,127,50,0.3)" },
};

function RankCell({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: rank === 1 ? "1.2rem" : "1rem",
          color: style.color,
          textShadow: style.glow,
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <span style={{ fontSize: "0.75rem" }}>{style.icon}</span>
        {rank}
      </span>
    );
  }
  return (
    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.9rem" }}>
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"season" | "global">("season");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const endpoint = tab === "season" ? "/api/rating/season" : "/api/rating/global";
    api
      .get(endpoint)
      .then((r) => {
        const entries: LeaderboardEntry[] = tab === "season" ? r.data.leaderboard : r.data;
        setData(entries ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <span style={{ color: "var(--gold)", fontSize: "1.2rem" }}>♦</span>
          <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-display)", fontWeight: 900 }}>
            Leaderboard
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
          Season standings & all-time rankings
        </p>
        <div className="gold-divider" />
      </div>

      {/* Tab switcher */}
      <div
        className="animate-in animate-in-delay-1"
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}
      >
        {(["season", "global"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "btn btn-gold" : "btn btn-ghost"}
            style={{ fontSize: "0.8rem" }}
          >
            {t === "season" ? "♠ This Season" : "♦ All Time"}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="spinner" />
        </div>
      )}

      {error && (
        <div className="card animate-in" style={{ padding: "1.25rem", borderColor: "rgba(231,76,60,0.4)" }}>
          <span style={{ color: "var(--danger)", fontSize: "0.85rem", fontWeight: 700 }}>⚠ {error}</span>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", opacity: 0.3, marginBottom: "1rem" }}>♦</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>No rankings yet</div>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="card animate-in animate-in-delay-2" style={{ overflow: "hidden" }}>
          {/* Top 3 podium */}
          {data.length >= 3 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1px",
                  background: "var(--card-border)",
                  borderBottom: "1px solid var(--card-border)",
                }}
              >
                {[data[1], data[0], data[2]].map((entry, i) => {
                  if (!entry) return null;
                  const isCenter = i === 1;
                  const heights = ["110px", "130px", "100px"];
                  const rankNums = [2, 1, 3];
                  const rankStyle = RANK_STYLES[rankNums[i]];
                  return (
                    <div
                      key={entry.user_id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        padding: "1rem 0.5rem 1.25rem",
                        background: isCenter ? "rgba(201,168,76,0.06)" : "var(--card-bg)",
                        height: heights[i],
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: rankStyle.color,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          marginBottom: "0.2rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {rankStyle.icon} {rankNums[i]}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: isCenter ? "1rem" : "0.85rem",
                          fontWeight: 700,
                          textAlign: "center",
                          color: isCenter ? "var(--text-primary)" : "var(--text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {entry.poker_nickname || entry.display_name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: isCenter ? "1.4rem" : "1.1rem",
                          fontWeight: 900,
                          color: rankStyle.color,
                          textShadow: rankStyle.glow,
                        }}
                      >
                        {entry.total_points.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                        pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Table */}
          <table className="poker-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Player</th>
                <th style={{ textAlign: "right" }}>Points</th>
                <th style={{ textAlign: "right" }}>KOs</th>
                <th style={{ textAlign: "right" }}>Played</th>
                <th style={{ textAlign: "right" }}>Best</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.user_id} style={{ opacity: entry.rank <= 3 ? 1 : 0.9 }}>
                  <td>
                    <RankCell rank={entry.rank} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {entry.poker_nickname || entry.display_name}
                    </div>
                    {entry.username && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        @{entry.username}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: entry.rank <= 3 ? "var(--gold)" : "var(--text-primary)",
                      }}
                    >
                      {entry.total_points.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {entry.total_knockouts > 0 ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.3rem" }}>
                        <span style={{ color: "var(--chip-red)", fontSize: "0.7rem" }}>✦</span>
                        {entry.total_knockouts}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-dim)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {entry.tournaments_played}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "0.85rem" }}>
                    {entry.best_finish != null ? (
                      <span style={{ color: entry.best_finish === 1 ? "var(--gold)" : "var(--text-secondary)" }}>
                        {entry.best_finish === 1 ? "🥇" : `${entry.best_finish}th`}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-dim)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}