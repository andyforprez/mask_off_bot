/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useState } from "react";
import { Notice, PageHeader } from "@/app/components/mobile-shell";
import { api, getApiError } from "@/app/lib/api";
import { AppUser, useTelegramUser } from "@/app/lib/telegram";

interface ProfileStats {
  user_id: number;
  display_name?: string;
  username?: string | null;
  total_points?: number;
  total_knockouts?: number;
  tournaments_played?: number;
  best_finish?: number | null;
  history?: Array<{
    tournament_id: number;
    final_position: number;
    points_earned: number;
    knockouts: number;
    recorded_at: string;
  }>;
}

export default function ProfilePage() {
  const { user, status, error, saveManualUser, isTelegram } = useTelegramUser();
  const [manualId, setManualId] = useState("");
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api
      .get<ProfileStats>(`/api/rating/profile/${user.id}`)
      .then((response) => {
        setStats(response.data);
        setStatsError(null);
      })
      .catch((err) => setStatsError(getApiError(err, "Could not load player stats")))
      .finally(() => setLoading(false));
  }, [user?.id]);

  function connectManual(event: FormEvent) {
    event.preventDefault();
    const id = Number(manualId);
    if (!Number.isFinite(id) || id <= 0) return;

    const manualUser: AppUser = {
      id,
      telegram_id: `manual-${id}`,
      username: "",
      display_name: `Player ${id}`,
      role: "player",
    };
    saveManualUser(manualUser);
  }

  const history = stats?.history ?? [];

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow={isTelegram ? "Telegram player" : "Manual player"}
        title={user?.display_name ?? "Your profile"}
        subtitle="Your tournament stats, knockouts, points, and recent history."
      />

      {status === "syncing" ? <Notice title="Connecting">Creating or loading your player account from Telegram…</Notice> : null}
      {error ? <Notice tone="danger" title="Telegram sync failed">{error}</Notice> : null}

      {!user ? (
        <form className="card connect-card" onSubmit={connectManual}>
          <h2>Connect without Telegram</h2>
          <p>If you are testing in a browser, enter your backend player ID to register for tournaments.</p>
          <input className="poker-input" inputMode="numeric" placeholder="Player ID" value={manualId} onChange={(event) => setManualId(event.target.value)} />
          <button className="btn btn-gold" type="submit">Save player</button>
        </form>
      ) : (
        <section className="profile-grid">
          {[
            ["Points", stats?.total_points ?? 0],
            ["Knockouts", stats?.total_knockouts ?? 0],
            ["Games", stats?.tournaments_played ?? 0],
            ["Best", stats?.best_finish ? `#${stats.best_finish}` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="stat-card card">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>
      )}

      {loading ? <div className="spinner-panel"><div className="spinner" /></div> : null}
      {statsError ? <Notice tone="danger" title="Stats unavailable">{statsError}</Notice> : null}

      {user ? (
        <section className="card history-card">
          <div className="section-title">
            <span>♣</span>
            <h2>Recent history</h2>
          </div>
          {history.length ? (
            history.map((game) => (
              <div key={`${game.tournament_id}-${game.recorded_at}`} className="history-row">
                <div>
                  <strong>Tournament #{game.tournament_id}</strong>
                  <span>{new Date(game.recorded_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <b>#{game.final_position}</b>
                  <span>+{game.points_earned} · {game.knockouts} KO</span>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No completed tournaments recorded yet.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}