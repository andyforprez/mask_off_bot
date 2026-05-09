"use client";

import { useEffect, useState } from "react";
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

const TYPE_LABELS: Record<string, string> = {
  standard:    "Standard",
  double:      "Double Rating",
  bounty:      "Bounty",
  high_roller: "High Roller",
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  registration_open: { label: "Open",      cls: "badge-green" },
  running:           { label: "Live",      cls: "badge-red"   },
  finished:          { label: "Finished",  cls: "badge-muted" },
  cancelled:         { label: "Cancelled", cls: "badge-muted" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
    time: d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  };
}

function TournamentCard({ t, idx }: { t: Tournament; idx: number }) {
  const { date, time, weekday } = formatDate(t.start_time);
  const status = STATUS_META[t.status] ?? { label: t.status, cls: "badge-muted" };
  const fillPct = t.max_players > 0 ? (t.current_players / t.max_players) * 100 : 0;

  return (
    <div
      className={`card corner-ornament animate-in animate-in-delay-${Math.min(idx + 1, 5)}`}
      style={{ padding: "1.25rem 1.5rem" }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-display)", marginBottom: "0.3rem" }}>
            {t.name}
          </h3>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <span className={`badge ${status.cls}`}>{status.label}</span>
            {t.is_bounty && <span className="badge badge-red">Bounty</span>}
            {t.is_highroller && <span className="badge badge-gold">High Roller</span>}
            {t.double_points && <span className="badge badge-blue">2× Points</span>}
          </div>
        </div>

        {/* Date block */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase" }}>
            {weekday}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--gold)", lineHeight: 1, fontWeight: 700 }}>
            {time}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            {date}
          </div>
        </div>
      </div>

      <div className="gold-divider-sm" />

      {/* Stats row */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Buy-in
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--gold)", fontWeight: 700 }}>
              {t.buy_in.toLocaleString()}₽
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Type
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {TYPE_LABELS[t.tournament_type] ?? t.tournament_type}
            </div>
          </div>
        </div>

        {/* Player fill */}
        <div style={{ minWidth: "120px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Players
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {t.current_players}/{t.max_players}
            </span>
          </div>
          <div style={{ height: "4px", borderRadius: "2px", background: "var(--card-border)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${fillPct}%`,
                borderRadius: "2px",
                background: fillPct >= 90
                  ? "var(--chip-red)"
                  : fillPct >= 60
                  ? "var(--gold)"
                  : "var(--success)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "4rem 2rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-display)",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>♠ ♥ ♦ ♣</div>
      <div style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>No tournaments scheduled</div>
      <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", fontFamily: "var(--font-ui)", letterSpacing: "0.06em" }}>
        Check back later or create one in Admin
      </div>
    </div>
  );
}

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Tournament[]>("/api/tournaments")
      .then((r) => setTournaments(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = tournaments.filter((t) => t.status !== "finished" && t.status !== "cancelled");
  const past     = tournaments.filter((t) => t.status === "finished");

  return (
    <div>
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <span style={{ color: "var(--gold)", fontSize: "1.2rem" }}>♠</span>
          <h1
            style={{
              fontSize: "2rem",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              letterSpacing: "0.02em",
            }}
          >
            Tournaments
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
          MaskOff Poker Club · Moscow
        </p>
        <div className="gold-divider" />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="spinner" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="card animate-in"
          style={{ padding: "1.25rem", borderColor: "rgba(231,76,60,0.4)", marginBottom: "1.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--chip-red)", fontSize: "1.1rem" }}>⚠</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--danger)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
                BACKEND UNREACHABLE
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.15rem" }}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {!loading && !error && (
        <>
          {upcoming.length > 0 ? (
            <section style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--success)",
                    boxShadow: "0 0 8px var(--success)",
                    animation: "pulse-gold 2s ease infinite",
                  }}
                />
                <h2
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-ui)",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Upcoming · {upcoming.length}
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {upcoming.map((t, i) => (
                  <TournamentCard key={t.id} t={t} idx={i} />
                ))}
              </div>
            </section>
          ) : (
            <EmptyState />
          )}

          {past.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: "1rem",
                }}
              >
                Recent Results · {past.length}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", opacity: 0.6 }}>
                {past.slice(0, 5).map((t, i) => (
                  <TournamentCard key={t.id} t={t} idx={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}