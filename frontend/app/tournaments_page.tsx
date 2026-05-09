"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/app/lib/api";

interface Tournament {
  id: number;
  name: string;
  status: string;
  tournament_type: string;
  buy_in: number;
  max_players: number;
  current_players: number;
  is_bounty: boolean;
  is_highroller: boolean;
  double_points: boolean;
  start_time: string;
}

interface RegistrationResult {
  id: number;
  status: "confirmed" | "waitlist" | "seated" | "eliminated";
  seat_number: number | null;
}

const TYPE_LABELS: Record<string, string> = {
  standard:    "Standard",
  double:      "Double Rating",
  bounty:      "Bounty",
  high_roller: "High Roller",
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  registration_open: { label: "Open",      cls: "badge-green" },
  running:           { label: "Live ●",    cls: "badge-red"   },
  finished:          { label: "Finished",  cls: "badge-muted" },
  cancelled:         { label: "Cancelled", cls: "badge-muted" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date:    d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
    time:    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

// ─── Registration Modal ───────────────────────────────────────────────────────

function RegisterModal({
  tournament,
  onClose,
}: {
  tournament: Tournament;
  onClose: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const register = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await api.post<RegistrationResult>(
        `/api/registrations/${tournament.id}/register?user_id=${userId}`
      );
      setResult(r.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setError(err?.response?.data?.detail ?? err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = result?.status === "confirmed";
  const isWaitlist  = result?.status === "waitlist";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          animation: "fadeInUp 0.15s ease both",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 51,
          width: "min(480px, 90vw)",
          animation: "fadeInUp 0.2s ease both",
        }}
      >
        <div className="card corner-ornament" style={{ padding: 0, overflow: "hidden" }}>

          {/* Header */}
          <div style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--card-border)",
            background: "rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem",
                }}>
                  ♠ Register for Tournament
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>
                  {tournament.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "1.2rem", lineHeight: 1,
                  padding: "0.2rem",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tournament info strip */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: "1px solid var(--card-border)",
          }}>
            {[
              { label: "Buy-in",   value: `${tournament.buy_in.toLocaleString()}₽` },
              { label: "Players",  value: `${tournament.current_players}/${tournament.max_players}` },
              { label: "Type",     value: TYPE_LABELS[tournament.tournament_type] ?? tournament.tournament_type },
            ].map(({ label, value }) => (
              <div key={label} className="stat-box" style={{ padding: "0.85rem 0.75rem" }}>
                <div className="stat-label">{label}</div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "1rem",
                  fontWeight: 700, color: "var(--gold)", marginTop: "0.2rem",
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Body */}
          <div style={{ padding: "1.5rem" }}>
            {!result ? (
              <>
                <label style={{
                  display: "block", fontSize: "0.7rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--text-muted)", marginBottom: "0.5rem",
                }}>
                  Your User ID
                </label>
                <input
                  className="poker-input"
                  type="number"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && register()}
                  autoFocus
                  style={{ marginBottom: "1rem", fontSize: "1.1rem" }}
                />

                {error && (
                  <div style={{
                    padding: "0.6rem 0.85rem", borderRadius: "4px", marginBottom: "1rem",
                    background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.35)",
                    color: "#e74c3c", fontSize: "0.82rem", letterSpacing: "0.03em",
                  }}>
                    ✗ {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    className="btn btn-gold"
                    onClick={register}
                    disabled={loading || !userId.trim()}
                    style={{ flex: 1 }}
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        Registering…
                      </span>
                    ) : "Register Now"}
                  </button>
                  <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                </div>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                <div style={{
                  fontSize: "2.5rem", marginBottom: "0.75rem",
                  animation: "fadeInUp 0.3s ease both",
                }}>
                  {isConfirmed ? "✅" : "⏳"}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "1.3rem",
                  fontWeight: 700, marginBottom: "0.4rem",
                  color: isConfirmed ? "var(--gold)" : "var(--text-secondary)",
                }}>
                  {isConfirmed ? "Seat Confirmed!" : "Added to Waitlist"}
                </h3>
                <p style={{
                  color: "var(--text-muted)", fontSize: "0.9rem",
                  fontFamily: "var(--font-body)", lineHeight: 1.5,
                  marginBottom: "1.25rem",
                }}>
                  {isConfirmed
                    ? `You're in. Registration ID: #${result.id}${result.seat_number ? ` · Seat ${result.seat_number}` : ""}.`
                    : `Tournament is full. You're on the waitlist (Registration #${result.id}). We'll notify you if a spot opens.`
                  }
                </p>
                <div className="gold-divider-sm" style={{ marginBottom: "1rem" }} />
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                  <a href={`/profile/${userId}`} className="btn btn-outline" style={{ fontSize: "0.8rem" }}>
                    View My Profile
                  </a>
                  <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: "0.8rem" }}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tournament Card ───────────────────────────────────────────────────────────

function TournamentCard({
  t,
  idx,
  onRegister,
}: {
  t: Tournament;
  idx: number;
  onRegister: (t: Tournament) => void;
}) {
  const { date, time, weekday } = formatDate(t.start_time);
  const status  = STATUS_META[t.status] ?? { label: t.status, cls: "badge-muted" };
  const fillPct = t.max_players > 0 ? (t.current_players / t.max_players) * 100 : 0;
  const isFull  = t.current_players >= t.max_players;
  const canReg  = t.status === "registration_open";

  return (
    <div
      className={`card corner-ornament animate-in animate-in-delay-${Math.min(idx + 1, 5)}`}
      style={{ padding: "1.25rem 1.5rem" }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: "1.1rem", fontFamily: "var(--font-display)",
            fontWeight: 700, marginBottom: "0.4rem",
          }}>
            {t.name}
          </h3>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <span className={`badge ${status.cls}`}>{status.label}</span>
            {t.is_bounty    && <span className="badge badge-red">Bounty</span>}
            {t.is_highroller && <span className="badge badge-gold">High Roller</span>}
            {t.double_points && <span className="badge badge-blue">2× Points</span>}
          </div>
        </div>

        {/* Date */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em",
            color: "var(--text-muted)", textTransform: "uppercase",
          }}>
            {weekday}
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "1.5rem",
            color: "var(--gold)", lineHeight: 1, fontWeight: 700,
          }}>
            {time}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
            {date}
          </div>
        </div>
      </div>

      <div className="gold-divider-sm" />

      {/* Bottom row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <div>
            <div style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "var(--text-muted)", textTransform: "uppercase",
            }}>Buy-in</div>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: "1.1rem",
              color: "var(--gold)", fontWeight: 700,
            }}>
              {t.buy_in.toLocaleString()}₽
            </div>
          </div>
          <div>
            <div style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "var(--text-muted)", textTransform: "uppercase",
            }}>Type</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {TYPE_LABELS[t.tournament_type] ?? t.tournament_type}
            </div>
          </div>
        </div>

        {/* Right side: players + register */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Fill bar */}
          <div style={{ minWidth: "100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                color: "var(--text-muted)", textTransform: "uppercase",
              }}>Players</span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                {t.current_players}/{t.max_players}
              </span>
            </div>
            <div style={{
              height: "4px", borderRadius: "2px",
              background: "var(--card-border)", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${fillPct}%`, borderRadius: "2px",
                background: fillPct >= 90 ? "var(--chip-red)"
                           : fillPct >= 60 ? "var(--gold)"
                           : "var(--success)",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Register button */}
          {canReg && (
            <button
              className={isFull ? "btn btn-ghost" : "btn btn-gold"}
              onClick={() => onRegister(t)}
              style={{ fontSize: "0.78rem", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {isFull ? "Join Waitlist" : "Register ♠"}
            </button>
          )}
          {!canReg && t.status === "running" && (
            <span style={{
              fontSize: "0.75rem", color: "var(--chip-red)",
              fontWeight: 700, letterSpacing: "0.06em",
              display: "flex", alignItems: "center", gap: "0.3rem",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "var(--chip-red)",
                boxShadow: "0 0 8px var(--chip-red)",
                animation: "pulse-gold 1.5s ease infinite",
                display: "inline-block",
              }} />
              In Progress
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selected, setSelected]       = useState<Tournament | null>(null);

  const load = useCallback(() => {
    api.get<Tournament[]>("/api/tournaments")
      .then((r) => setTournaments(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const upcoming = tournaments.filter((t) => t.status !== "finished" && t.status !== "cancelled");
  const past     = tournaments.filter((t) => t.status === "finished");

  const handleClose = () => {
    setSelected(null);
    load(); // refresh counts after registration
  };

  return (
    <>
      {selected && <RegisterModal tournament={selected} onClose={handleClose} />}

      <div>
        {/* Header */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "var(--gold)", fontSize: "1.2rem" }}>♠</span>
                <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-display)", fontWeight: 900 }}>
                  Tournaments
                </h1>
              </div>
              <p style={{
                color: "var(--text-muted)", fontFamily: "var(--font-ui)",
                fontSize: "0.9rem", letterSpacing: "0.05em",
              }}>
                MaskOff Poker Club · Moscow
              </p>
            </div>
            {/* Quick-register hint */}
            {upcoming.some(t => t.status === "registration_open") && (
              <div style={{
                padding: "0.6rem 1rem",
                background: "rgba(39,174,96,0.08)",
                border: "1px solid rgba(39,174,96,0.25)",
                borderRadius: "6px",
                fontSize: "0.78rem",
                color: "#27ae60",
                fontFamily: "var(--font-ui)",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}>
                ● Registration open
              </div>
            )}
          </div>
          <div className="gold-divider" />
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div className="card animate-in" style={{
            padding: "1.25rem", borderColor: "rgba(231,76,60,0.4)", marginBottom: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: "var(--chip-red)", fontSize: "1.1rem" }}>⚠</span>
              <div>
                <div style={{ fontWeight: 700, color: "var(--danger)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
                  BACKEND UNREACHABLE
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.1rem" }}>{error}</div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {upcoming.length > 0 ? (
              <section style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "var(--success)", boxShadow: "0 0 8px var(--success)",
                    animation: "pulse-gold 2s ease infinite",
                  }} />
                  <h2 style={{
                    fontSize: "0.72rem", fontFamily: "var(--font-ui)", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)",
                  }}>
                    Upcoming · {upcoming.length}
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {upcoming.map((t, i) => (
                    <TournamentCard key={t.id} t={t} idx={i} onRegister={setSelected} />
                  ))}
                </div>
              </section>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", opacity: 0.25, marginBottom: "1rem" }}>♠ ♥ ♦ ♣</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-secondary)" }}>
                  No tournaments scheduled
                </div>
                <div style={{
                  fontSize: "0.85rem", marginTop: "0.5rem",
                  fontFamily: "var(--font-ui)", letterSpacing: "0.06em",
                }}>
                  Create one from the Admin panel
                </div>
              </div>
            )}

            {past.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: "0.72rem", fontFamily: "var(--font-ui)", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)",
                  marginBottom: "1rem",
                }}>
                  Recent Results · {past.length}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", opacity: 0.55 }}>
                  {past.slice(0, 5).map((t, i) => (
                    <TournamentCard key={t.id} t={t} idx={i} onRegister={setSelected} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}