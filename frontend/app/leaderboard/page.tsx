/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Notice, PageHeader } from "@/app/components/mobile-shell";
import { api, getApiError } from "@/app/lib/api";

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  poker_nickname?: string;
  display_name?: string;
  username?: string | null;
  total_points: number;
  total_knockouts: number;
  tournaments_played: number;
  best_finish: number | null;
}

function nameFor(entry: LeaderboardEntry) {
  return entry.poker_nickname || entry.display_name || entry.username || `Player ${entry.user_id}`;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"season" | "global">("season");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [seasonName, setSeasonName] = useState("Current season");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(tab === "season" ? "/api/rating/season" : "/api/rating/global")
      .then((response) => {
        setData(tab === "season" ? response.data.leaderboard ?? [] : response.data ?? []);
        if (response.data.season_name) setSeasonName(response.data.season_name);
      })
      .catch((err) => setError(getApiError(err, "Could not load leaderboard")))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="screen-stack">
      <PageHeader eyebrow="Rating" title="Leaderboard" subtitle={`${seasonName} standings and all-time club results.`} />

      <div className="segmented-control" role="tablist" aria-label="Leaderboard type">
        <button className={tab === "season" ? "active" : ""} onClick={() => setTab("season")}>Season</button>
        <button className={tab === "global" ? "active" : ""} onClick={() => setTab("global")}>All time</button>
      </div>

      {loading ? <div className="spinner-panel"><div className="spinner" /></div> : null}
      {error ? <Notice tone="danger" title="Backend unreachable">{error}</Notice> : null}

      {!loading && !error ? (
        data.length ? (
          <section className="leaderboard-list">
            {data.map((entry, index) => (
              <article key={`${entry.user_id}-${entry.rank ?? index}`} className="leader-card card">
                <div className={`rank rank-${entry.rank}`}>#{entry.rank ?? index + 1}</div>
                <div className="leader-info">
                  <h2>{nameFor(entry)}</h2>
                  <p>{entry.tournaments_played} games · best {entry.best_finish ? `#${entry.best_finish}` : "—"}</p>
                </div>
                <div className="leader-score">
                  <strong>{entry.total_points}</strong>
                  <span>{entry.total_knockouts} KO</span>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="empty-state card">
            <span>♦</span>
            <h2>No ranking yet</h2>
            <p>Record tournament results from Admin to fill the leaderboard.</p>
          </section>
        )
      ) : null}
    </div>
  );
}