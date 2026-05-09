"use client";

import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "@/app/lib/api";
import { useTelegramUser } from "@/app/lib/telegram";
import { Notice, PageHeader } from "@/app/components/mobile-shell";

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
  tournament_id: number;
  user_id: number;
  status: "confirmed" | "waitlist" | "seated" | "eliminated";
  seat_number: number | null;
}

const typeLabels: Record<string, string> = {
  standard: "Standard",
  double: "Double points",
  bounty: "Bounty",
  high_roller: "High Roller",
};

const statusLabels: Record<string, string> = {
  registration_open: "Open",
  running: "Live",
  finished: "Finished",
  cancelled: "Cancelled",
};

function formatDate(value: string) {
  const date = new Date(value);
  return {
    day: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

function TournamentCard({ tournament, userId, onRegistered }: { tournament: Tournament; userId?: number; onRegistered: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hapticSuccess = () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
  const hapticError = () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
  const hapticTap = () => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  const { day, time } = formatDate(tournament.start_time);
  const seatsLeft = Math.max(tournament.max_players - tournament.current_players, 0);
  const fill = tournament.max_players ? Math.min(100, (tournament.current_players / tournament.max_players) * 100) : 0;
  const canRegister = tournament.status === "registration_open";

  async function register() {
    hapticTap();
    if (!userId) {
      setMessage("Open Profile first so the app can connect your Telegram account.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await api.post<RegistrationResult>(`/api/registrations/${tournament.id}/register`, null, {
        params: { user_id: userId },
      });
      const waitlist = response.data.status === "waitlist";
      setMessage(waitlist ? "Tournament is full — you are on the waitlist." : "Seat confirmed. See you at the table!");
      hapticSuccess();
      onRegistered();
    } catch (error) {
      setMessage(getApiError(error, "Registration failed"));
      hapticError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="tournament-card card">
      <div className="card-topline">
        <span className={`status-dot status-${tournament.status}`} />
        <span>{statusLabels[tournament.status] ?? tournament.status}</span>
        <strong>{typeLabels[tournament.tournament_type] ?? tournament.tournament_type}</strong>
      </div>

      <div className="tournament-main">
        <div>
          <h2>{tournament.name}</h2>
          <div className="badges">
            {tournament.is_bounty ? <span className="badge badge-red">Bounty</span> : null}
            {tournament.is_highroller ? <span className="badge badge-gold">High Roller</span> : null}
            {tournament.double_points ? <span className="badge badge-blue">2× Rating</span> : null}
          </div>
        </div>
        <time>
          <strong>{time}</strong>
          <span>{day}</span>
        </time>
      </div>

      <div className="seat-meter" aria-label={`${tournament.current_players} of ${tournament.max_players} players registered`}>
        <div>
          <span>{tournament.current_players}/{tournament.max_players} players</span>
          <strong>{seatsLeft > 0 ? `${seatsLeft} seats left` : "Waitlist"}</strong>
        </div>
        <i><b style={{ width: `${fill}%` }} /></i>
      </div>

      <div className="card-actions">
        <div className="buyin">
          <span>Buy-in</span>
          <strong>{tournament.buy_in.toLocaleString()}₽</strong>
        </div>
        <button className="btn btn-gold" onClick={register} disabled={!canRegister || loading}>
          {loading ? "Joining…" : canRegister ? "Join" : "Closed"}
        </button>
      </div>

      {message ? <p className="card-message">{message}</p> : null}
    </article>
  );
}

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, status, error: userError, isTelegram } = useTelegramUser();

  function loadTournaments() {
    api
      .get<Tournament[]>("/api/tournaments")
      .then((response) => {
        setTournaments(response.data);
        setError(null);
      })
      .catch((err) => setError(getApiError(err, "Could not load tournaments")))
      .finally(() => setLoading(false));
  }

  useEffect(loadTournaments, []);

  const upcoming = useMemo(
    () => tournaments.filter((tournament) => !["finished", "cancelled"].includes(tournament.status)),
    [tournaments],
  );

  const liveCount = upcoming.filter((tournament) => tournament.status === "running").length;

  return (
    <div className="screen-stack">
      <PageHeader
        eyebrow={isTelegram ? "Connected to Telegram" : "Browser preview"}
        title="Find your next game"
        subtitle="Register for MaskOff tournaments in two taps from your phone."
        action={<div className="hero-stat"><strong>{liveCount}</strong><span>Live</span></div>}
      />

      {status === "syncing" ? <Notice title="Connecting">Syncing your Telegram profile with the club backend…</Notice> : null}
      {userError ? <Notice tone="danger" title="Profile warning">{userError}</Notice> : null}
      {!user ? <Notice title="Player profile needed">Use the Profile tab to connect your Telegram account or enter your player ID before registering.</Notice> : null}

      {loading ? <div className="spinner-panel"><div className="spinner" /></div> : null}
      {error ? <Notice tone="danger" title="Backend unreachable">{error}</Notice> : null}

      {!loading && !error ? (
        upcoming.length ? (
          <section className="card-list">
            {upcoming.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} userId={user?.id} onRegistered={loadTournaments} />
            ))}
          </section>
        ) : (
          <section className="empty-state card">
            <span>♠ ♥ ♦ ♣</span>
            <h2>No games scheduled</h2>
            <p>Check back soon — new tournaments will appear here automatically.</p>
          </section>
        )
      ) : null}
    </div>
  );
}