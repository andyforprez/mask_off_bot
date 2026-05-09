"use client";

import { FormEvent, useState } from "react";
import { Notice, PageHeader } from "@/app/components/mobile-shell";
import { api, getApiError } from "@/app/lib/api";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function AdminCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return <section className="admin-card card"><div className="section-title"><span>{icon}</span><h2>{title}</h2></div>{children}</section>;
}

export default function AdminPage() {
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [tournament, setTournament] = useState({
    name: "Friday Night Deepstack",
    tournament_type: "standard",
    buy_in: "5000",
    max_players: "36",
    start_time: "",
    is_bounty: false,
    is_highroller: false,
    double_points: false,
  });
  const [result, setResult] = useState({
    tournament_id: "",
    user_id: "",
    final_position: "",
    total_players: "",
    tournament_type: "standard",
    knockouts: "0",
  });

  async function submitTournament(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setToast(null);
    try {
      await api.post("/api/tournaments/", {
        ...tournament,
        buy_in: Number(tournament.buy_in),
        max_players: Number(tournament.max_players),
        start_time: new Date(tournament.start_time).toISOString(),
      });
      setToast({ ok: true, message: "Tournament created and visible on the Games tab." });
    } catch (error) {
      setToast({ ok: false, message: getApiError(error, "Could not create tournament") });
    } finally {
      setBusy(false);
    }
  }

  async function submitResult(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setToast(null);
    try {
      await api.post("/api/admin/results/record", {
        tournament_id: Number(result.tournament_id),
        user_id: Number(result.user_id),
        final_position: Number(result.final_position),
        total_players: Number(result.total_players),
        tournament_type: result.tournament_type,
        knockouts: Number(result.knockouts),
      });
      setToast({ ok: true, message: "Result recorded. Leaderboards and profile stats will update." });
    } catch (error) {
      setToast({ ok: false, message: getApiError(error, "Could not record result") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen-stack">
      <PageHeader eyebrow="Club ops" title="Admin" subtitle="Mobile-safe controls for creating games and recording results." />
      {toast ? <Notice tone={toast.ok ? "success" : "danger"} title={toast.ok ? "Done" : "Error"}>{toast.message}</Notice> : null}

      <AdminCard title="Create tournament" icon="♠">
        <form className="form-stack" onSubmit={submitTournament}>
          <Field label="Name"><input className="poker-input" value={tournament.name} onChange={(e) => setTournament((v) => ({ ...v, name: e.target.value }))} /></Field>
          <div className="form-grid">
            <Field label="Buy-in"><input className="poker-input" inputMode="numeric" value={tournament.buy_in} onChange={(e) => setTournament((v) => ({ ...v, buy_in: e.target.value }))} /></Field>
            <Field label="Max players"><input className="poker-input" inputMode="numeric" value={tournament.max_players} onChange={(e) => setTournament((v) => ({ ...v, max_players: e.target.value }))} /></Field>
          </div>
          <Field label="Start time"><input className="poker-input" type="datetime-local" value={tournament.start_time} onChange={(e) => setTournament((v) => ({ ...v, start_time: e.target.value }))} required /></Field>
          <Field label="Type"><select className="poker-input" value={tournament.tournament_type} onChange={(e) => setTournament((v) => ({ ...v, tournament_type: e.target.value }))}><option value="standard">Standard</option><option value="double">Double points</option><option value="bounty">Bounty</option><option value="high_roller">High Roller</option></select></Field>
          <div className="toggle-row">
            {[["is_bounty", "Bounty"], ["is_highroller", "High roller"], ["double_points", "2× points"]].map(([key, label]) => (
              <label key={key}><input type="checkbox" checked={Boolean(tournament[key as keyof typeof tournament])} onChange={(e) => setTournament((v) => ({ ...v, [key]: e.target.checked }))} /> {label}</label>
            ))}
          </div>
          <button className="btn btn-gold" disabled={busy} type="submit">{busy ? "Saving…" : "Create game"}</button>
        </form>
      </AdminCard>

      <AdminCard title="Record result" icon="♦">
        <form className="form-stack" onSubmit={submitResult}>
          <div className="form-grid">
            <Field label="Tournament ID"><input className="poker-input" inputMode="numeric" value={result.tournament_id} onChange={(e) => setResult((v) => ({ ...v, tournament_id: e.target.value }))} /></Field>
            <Field label="User ID"><input className="poker-input" inputMode="numeric" value={result.user_id} onChange={(e) => setResult((v) => ({ ...v, user_id: e.target.value }))} /></Field>
            <Field label="Position"><input className="poker-input" inputMode="numeric" value={result.final_position} onChange={(e) => setResult((v) => ({ ...v, final_position: e.target.value }))} /></Field>
            <Field label="Players"><input className="poker-input" inputMode="numeric" value={result.total_players} onChange={(e) => setResult((v) => ({ ...v, total_players: e.target.value }))} /></Field>
            <Field label="Knockouts"><input className="poker-input" inputMode="numeric" value={result.knockouts} onChange={(e) => setResult((v) => ({ ...v, knockouts: e.target.value }))} /></Field>
            <Field label="Type"><select className="poker-input" value={result.tournament_type} onChange={(e) => setResult((v) => ({ ...v, tournament_type: e.target.value }))}><option value="standard">Standard</option><option value="double">Double points</option><option value="bounty">Bounty</option><option value="high_roller">High Roller</option></select></Field>
          </div>
          <button className="btn btn-outline" disabled={busy} type="submit">{busy ? "Recording…" : "Record result"}</button>
        </form>
      </AdminCard>
    </div>
  );
}
