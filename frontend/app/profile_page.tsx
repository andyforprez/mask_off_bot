"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/app/lib/api";

interface GameResult {
  tournament_id: number;
  final_position: number;
  points_earned: number;
  knockouts: number;
  recorded_at: string;
}

interface ProfileStats {
  season_points: number;
  total_knockouts: number;
  tournaments_played: number;
  best_finish: number | null;
  history: GameResult[];
}

// Rough points → rank mapping for a fun display
function getRankTitle(pts: number): { title: string; icon: string; color: string } {
  if (pts >= 5000) return { title: "Poker Legend",  icon: "♛", color: "#ffd700" };
  if (pts >= 3000) return { title: "High Roller",   icon: "♠", color: "#c0c0c0" };
  if (pts >= 1500) return { title: "Shark",         icon: "♦", color: "#c9a84c" };
  if (pts >= 700)  return { title: "Regular",       icon: "♥", color: "#5dade2" };
  if (pts >= 200)  return { title: "Fish",          icon: "♣", color: "#27ae60" };
  return             { title: "Newcomer",    icon: "◇", color: "#5a7060" };
}

function PositionBadge({ pos }: { pos: number }) {
  if (pos === 1) return <span style={{ color: "#ffd700", fontWeight: 800 }}>🥇 1st</span>;
  if (pos === 2) return <span style={{ color: "#c0c0c0", fontWeight: 800 }}>🥈 2nd</span>;
  if (pos === 3) return <span style={{ color: "#cd7f32", fontWeight: 800 }}>🥉 3rd</span>;
  return <span style={{ color: "var(--text-secondary)" }}>{pos}<span style={{ fontSize: "0.7em", marginLeft: "1px" }}>{getOrdinal(pos)}</span></span>;
}

function getOrdinal(n: number) {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return s[(v-20)%10] ?? s[v] ?? s[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Mini sparkline from history
function PointsSparkline({ history }: { history: GameResult[] }) {
  if (history.length < 2) return null;
  const pts  = [...history].reverse().map((h) => h.points_earned);
  const max  = Math.max(...pts, 1);
  const W    = 120;
  const H    = 36;
  const step = W / (pts.length - 1);
  const points = pts
    .map((p, i) => `${i * step},${H - (p / max) * H}`)
    .join(" ");

  return (
    <svg
      width={W} height={H}
      style={{ display: "block", overflow: "visible" }}
      viewBox={`0 0 ${W} ${H}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Last dot */}
      <circle
        cx={(pts.length - 1) * step}
        cy={H - (pts[pts.length - 1] / max) * H}
        r="3"
        fill="var(--gold)"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const params              = useParams<{ userId: string }>();
  const userId              = params?.userId;
  const [stats, setStats]   = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    api
      .get<ProfileStats>(`/api/rating/profile/${userId}`)
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div style={{ padding: "2rem" }}>
      <div className="card" style={{ padding: "1.25rem", borderColor: "rgba(231,76,60,0.4)" }}>
        <span style={{ color: "var(--danger)", fontWeight: 700 }}>⚠ {error}</span>
      </div>
    </div>
  );

  if (!stats) return null;

  const rank = getRankTitle(stats.season_points);
  const winRate = stats.tournaments_played > 0
    ? ((stats.history.filter((h) => h.final_position === 1).length / stats.tournaments_played) * 100).toFixed(0)
    : "0";
  const avgPoints = stats.tournaments_played > 0
    ? Math.round(stats.season_points / stats.tournaments_played)
    : 0;

  return (
    <div>
      {/* Back link */}
      <a
        href="/"
        className="animate-in"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.06em",
          textDecoration: "none", marginBottom: "1.5rem",
          fontFamily: "var(--font-ui)", fontWeight: 600, textTransform: "uppercase",
          transition: "color 0.15s",
        }}
      >
        ← Back to Tournaments
      </a>

      {/* Profile hero */}
      <div
        className="card animate-in"
        style={{
          marginBottom: "1.5rem",
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--card-bg) 0%, rgba(26,61,40,0.4) 100%)",
        }}
      >
        {/* Gold top stripe */}
        <div style={{
          height: "3px",
          background: "linear-gradient(90deg, transparent, var(--gold-dark), var(--gold), var(--gold-dark), transparent)",
        }} />

        <div style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Avatar placeholder */}
            <div style={{
              width: "72px", height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--felt-light), var(--card-border))",
              border: "2px solid var(--gold-dark)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem",
              flexShrink: 0,
              boxShadow: "var(--shadow-gold)",
            }}>
              {rank.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: rank.color, marginBottom: "0.3rem",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}>
                <span>{rank.icon}</span> {rank.title}
              </div>
              <h1 style={{
                fontFamily: "var(--font-display)", fontSize: "1.8rem",
                fontWeight: 900, lineHeight: 1, marginBottom: "0.5rem",
              }}>
                Player #{userId}
              </h1>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {stats.best_finish === 1 && (
                  <span className="badge badge-gold">🥇 Tournament Winner</span>
                )}
                {stats.total_knockouts >= 50 && (
                  <span className="badge badge-red">💀 Knockout Artist</span>
                )}
                {stats.tournaments_played >= 20 && (
                  <span className="badge badge-blue">♠ Veteran</span>
                )}
                {stats.tournaments_played === 0 && (
                  <span className="badge badge-muted">New Player</span>
                )}
              </div>
            </div>

            {/* Season points big number */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.2rem",
              }}>
                Season Points
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "3rem",
                fontWeight: 900, lineHeight: 1, color: "var(--gold)",
                textShadow: "0 0 30px rgba(201,168,76,0.4)",
              }}>
                {stats.season_points.toLocaleString()}
              </div>
              <PointsSparkline history={stats.history} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div
        className="card animate-in animate-in-delay-1"
        style={{ marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
      >
        {[
          { label: "Tournaments",  value: String(stats.tournaments_played), icon: "♠" },
          { label: "Knockouts",    value: String(stats.total_knockouts),    icon: "✦" },
          { label: "Best Finish",  value: stats.best_finish != null ? `${stats.best_finish}${getOrdinal(stats.best_finish)}` : "—", icon: "♛" },
          { label: "Avg Pts",      value: String(avgPoints),                icon: "♦" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stat-box">
            <div style={{ color: "var(--gold)", fontSize: "0.9rem", marginBottom: "0.3rem" }}>{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Win rate bar */}
      {stats.tournaments_played > 0 && (
        <div
          className="card animate-in animate-in-delay-2"
          style={{ padding: "1.25rem", marginBottom: "1.5rem" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--text-muted)",
            }}>
              Career Snapshot
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {winRate}% win rate
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {/* Win rate */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Wins</span>
                <span style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 700 }}>
                  {stats.history.filter(h => h.final_position === 1).length}
                </span>
              </div>
              <div style={{ height: "6px", borderRadius: "3px", background: "var(--card-border)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "3px",
                  width: `${winRate}%`,
                  background: "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
            {/* Top 3 rate */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Top 3</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>
                  {stats.history.filter(h => h.final_position <= 3).length}
                </span>
              </div>
              <div style={{ height: "6px", borderRadius: "3px", background: "var(--card-border)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "3px",
                  width: `${stats.tournaments_played > 0 ? (stats.history.filter(h => h.final_position <= 3).length / stats.tournaments_played * 100) : 0}%`,
                  background: "linear-gradient(90deg, var(--gold-dark), #e8c96a)",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game History Table */}
      <div className="card animate-in animate-in-delay-3" style={{ overflow: "hidden" }}>
        <div style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--card-border)",
          background: "rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: "0.6rem",
        }}>
          <span style={{ color: "var(--gold)" }}>♣</span>
          <h2 style={{
            fontFamily: "var(--font-ui)", fontWeight: 700,
            fontSize: "0.75rem", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--text-secondary)",
          }}>
            Recent History · {stats.history.length} games
          </h2>
        </div>

        {stats.history.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem" }}>
              No games recorded yet
            </div>
          </div>
        ) : (
          <table className="poker-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th style={{ textAlign: "center" }}>Position</th>
                <th style={{ textAlign: "center" }}>Knockouts</th>
                <th style={{ textAlign: "right" }}>Points</th>
                <th style={{ textAlign: "right" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.history.map((game, i) => {
                const isWin  = game.final_position === 1;
                const isTop3 = game.final_position <= 3;
                return (
                  <tr key={i}>
                    <td>
                      <a
                        href={`/tournaments/${game.tournament_id}`}
                        style={{
                          color: "var(--text-secondary)", textDecoration: "none",
                          fontWeight: 600, fontSize: "0.9rem",
                          display: "flex", alignItems: "center", gap: "0.4rem",
                        }}
                      >
                        <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                          #{game.tournament_id}
                        </span>
                      </a>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        minWidth: "60px",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "3px",
                        background: isWin  ? "rgba(255,215,0,0.12)"
                                  : isTop3 ? "rgba(201,168,76,0.08)"
                                  : "transparent",
                        border: isWin  ? "1px solid rgba(255,215,0,0.3)"
                              : isTop3 ? "1px solid rgba(201,168,76,0.2)"
                              : "1px solid transparent",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}>
                        <PositionBadge pos={game.final_position} />
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {game.knockouts > 0 ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          color: "var(--chip-red)", fontWeight: 700, fontSize: "0.9rem",
                        }}>
                          <span style={{ fontSize: "0.65rem" }}>✦</span>
                          {game.knockouts}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: "1rem",
                        color: game.points_earned > avgPoints ? "var(--gold)" : "var(--text-secondary)",
                      }}>
                        +{game.points_earned}
                      </span>
                    </td>
                    <td style={{
                      textAlign: "right", fontSize: "0.8rem", color: "var(--text-muted)",
                    }}>
                      {formatDate(game.recorded_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}