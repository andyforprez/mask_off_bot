"use client";

import { useState } from "react";
import { api } from "@/app/lib/api";

// ─── Shared form wrapper ──────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="card animate-in" style={{ marginBottom: "1.5rem", overflow: "hidden" }}>
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--card-border)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <span style={{ color: "var(--gold)", fontSize: "1rem" }}>{icon}</span>
        <h2
          style={{
            fontFamily: "var(--font-ui)",
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: "1.25rem" }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      style={{
        padding: "0.6rem 1rem",
        borderRadius: "4px",
        background: ok ? "rgba(39,174,96,0.15)" : "rgba(231,76,60,0.15)",
        border: `1px solid ${ok ? "rgba(39,174,96,0.4)" : "rgba(231,76,60,0.4)"}`,
        color: ok ? "#27ae60" : "#e74c3c",
        fontSize: "0.82rem",
        fontFamily: "var(--font-ui)",
        marginTop: "0.75rem",
        letterSpacing: "0.04em",
      }}
    >
      {ok ? "✓" : "✗"} {msg}
    </div>
  );
}

// ─── Record Result ────────────────────────────────────────────────────────────

function RecordResultForm() {
  const [form, setForm] = useState({
    tournament_id: "",
    user_id: "",
    final_position: "",
    total_players: "",
    tournament_type: "standard",
    knockouts: "0",
  });
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/api/admin/results/record", {
        tournament_id: Number(form.tournament_id),
        user_id: Number(form.user_id),
        final_position: Number(form.final_position),
        total_players: Number(form.total_players),
        tournament_type: form.tournament_type,
        knockouts: Number(form.knockouts),
      });
      setStatus({ msg: "Result recorded successfully.", ok: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setStatus({ msg: err?.response?.data?.detail ?? err?.message ?? "Error", ok: false });
    } finally {
      setLoading(false);
    }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Section title="Record Tournament Result" icon="♠">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Tournament ID">
          <input className="poker-input" type="number" placeholder="1" value={form.tournament_id} onChange={f("tournament_id")} />
        </Field>
        <Field label="Player (User ID)">
          <input className="poker-input" type="number" placeholder="1" value={form.user_id} onChange={f("user_id")} />
        </Field>
        <Field label="Final Position">
          <input className="poker-input" type="number" placeholder="1" value={form.final_position} onChange={f("final_position")} />
        </Field>
        <Field label="Total Players">
          <input className="poker-input" type="number" placeholder="90" value={form.total_players} onChange={f("total_players")} />
        </Field>
        <Field label="Tournament Type">
          <select className="poker-input" value={form.tournament_type} onChange={f("tournament_type")}
            style={{ cursor: "pointer" }}>
            <option value="standard">Standard</option>
            <option value="double">Double Rating</option>
            <option value="bounty">Bounty</option>
            <option value="high_roller">High Roller</option>
          </select>
        </Field>
        <Field label="Knockouts">
          <input className="poker-input" type="number" placeholder="0" value={form.knockouts} onChange={f("knockouts")} />
        </Field>
      </div>
      <button className="btn btn-gold" onClick={submit} disabled={loading} style={{ marginTop: "0.5rem" }}>
        {loading ? "Saving…" : "Record Result"}
      </button>
      {status && <Toast msg={status.msg} ok={status.ok} />}
    </Section>
  );
}

// ─── Record Elimination ───────────────────────────────────────────────────────

function EliminationForm() {
  const [form, setForm] = useState({
    tournament_id: "",
    eliminated_user_id: "",
    finish_position: "",
    eliminated_by_user_id: "",
    recorded_by: "",
  });
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/api/admin/eliminations/record", {
        tournament_id: Number(form.tournament_id),
        eliminated_user_id: Number(form.eliminated_user_id),
        finish_position: Number(form.finish_position),
        eliminated_by_user_id: form.eliminated_by_user_id ? Number(form.eliminated_by_user_id) : null,
        recorded_by: form.recorded_by || null,
      });
      setStatus({ msg: "Elimination recorded.", ok: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setStatus({ msg: err?.response?.data?.detail ?? err?.message ?? "Error", ok: false });
    } finally {
      setLoading(false);
    }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Section title="Record Elimination (Live)" icon="♥">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Tournament ID">
          <input className="poker-input" type="number" placeholder="1" value={form.tournament_id} onChange={f("tournament_id")} />
        </Field>
        <Field label="Eliminated Player ID">
          <input className="poker-input" type="number" placeholder="User ID" value={form.eliminated_user_id} onChange={f("eliminated_user_id")} />
        </Field>
        <Field label="Finish Position">
          <input className="poker-input" type="number" placeholder="45" value={form.finish_position} onChange={f("finish_position")} />
        </Field>
        <Field label="Knocked Out By (optional)">
          <input className="poker-input" type="number" placeholder="User ID" value={form.eliminated_by_user_id} onChange={f("eliminated_by_user_id")} />
        </Field>
      </div>
      <button className="btn btn-gold" onClick={submit} disabled={loading} style={{ marginTop: "0.5rem" }}>
        {loading ? "Saving…" : "Record Knockout"}
      </button>
      {status && <Toast msg={status.msg} ok={status.ok} />}
    </Section>
  );
}

// ─── Grant Coins ──────────────────────────────────────────────────────────────

function GrantCoinsForm() {
  const [form, setForm] = useState({ user_id: "", amount: "", note: "" });
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/api/admin/maskcoins/grant", {
        user_id: Number(form.user_id),
        amount: Number(form.amount),
        note: form.note || null,
      });
      setStatus({ msg: `Granted ${form.amount} maskcoins to user ${form.user_id}.`, ok: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setStatus({ msg: err?.response?.data?.detail ?? err?.message ?? "Error", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Grant Maskcoins" icon="♦">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Player (User ID)">
          <input className="poker-input" type="number" placeholder="1"
            value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))} />
        </Field>
        <Field label="Amount">
          <input className="poker-input" type="number" placeholder="500"
            value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
        </Field>
        <Field label="Note (optional)">
          <input className="poker-input" placeholder="e.g. Season prize"
            value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
        </Field>
      </div>
      <button className="btn btn-gold" onClick={submit} disabled={loading} style={{ marginTop: "0.5rem" }}>
        {loading ? "Granting…" : "Grant Coins"}
      </button>
      {status && <Toast msg={status.msg} ok={status.ok} />}
    </Section>
  );
}

// ─── Create Season ────────────────────────────────────────────────────────────

function SeasonForm() {
  const [form, setForm] = useState({ name: "", start_date: "" });
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/api/admin/seasons/create", form);
      setStatus({ msg: `Season "${res.data.name}" created (ID: ${res.data.id}).`, ok: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setStatus({ msg: err?.response?.data?.detail ?? err?.message ?? "Error", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Create Season" icon="♣">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Season Name">
          <input className="poker-input" placeholder="MAY POKER SEASON 2026"
            value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </Field>
        <Field label="Start Date">
          <input className="poker-input" type="date"
            value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
        </Field>
      </div>
      <button className="btn btn-gold" onClick={submit} disabled={loading} style={{ marginTop: "0.5rem" }}>
        {loading ? "Creating…" : "Create Season"}
      </button>
      {status && <Toast msg={status.msg} ok={status.ok} />}
    </Section>
  );
}

// ─── Blind Timer Controls ─────────────────────────────────────────────────────

function TimerControls() {
  const [tid, setTid] = useState("");
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTimer = async () => {
    if (!tid) return;
    setLoading(true);
    try {
      const r = await api.get(`/api/admin/timer/${tid}`);
      setState(r.data);
    } catch {
      setState(null);
    } finally {
      setLoading(false);
    }
  };

  const control = async (action: string) => {
    await api.post(`/api/admin/timer/${tid}/${action}`);
    fetchTimer();
  };

  return (
    <Section title="Blind Timer Controls" icon="⏱">
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Field label="Tournament ID">
            <input className="poker-input" type="number" placeholder="1" value={tid}
              onChange={(e) => setTid(e.target.value)} />
          </Field>
        </div>
        <button className="btn btn-outline" onClick={fetchTimer} disabled={loading}>
          {loading ? "…" : "Load"}
        </button>
      </div>

      {state && (
        <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {[
              { label: "Level",    value: String(state.current_level) },
              { label: "Blinds",   value: `${state.small_blind}/${state.big_blind}` },
              { label: "Time Left", value: `${state.seconds_remaining}s` },
              { label: "Players",  value: String(state.players_remaining ?? "—") },
              { label: "Avg Stack", value: state.average_stack ? Number(state.average_stack).toLocaleString() : "—" },
              { label: "Running",  value: state.is_running ? "Yes" : "Paused" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                  {label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--gold)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={() => control("play")} style={{ fontSize: "0.8rem" }}>▶ Play</button>
            <button className="btn btn-outline" onClick={() => control("pause")} style={{ fontSize: "0.8rem" }}>⏸ Pause</button>
            <button className="btn btn-ghost" onClick={() => control("next-level")} style={{ fontSize: "0.8rem" }}>⏭ Next Level</button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <div>
      <div className="animate-in" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <span style={{ color: "var(--gold)", fontSize: "1.2rem" }}>⚙</span>
          <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-display)", fontWeight: 900 }}>
            Admin Panel
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
          Club operations & tournament management
        </p>
        <div className="gold-divider" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", alignItems: "start" }}>
        <div style={{ paddingRight: "0.75rem" }}>
          <RecordResultForm />
          <GrantCoinsForm />
          <SeasonForm />
        </div>
        <div style={{ paddingLeft: "0.75rem" }}>
          <EliminationForm />
          <TimerControls />
        </div>
      </div>
    </div>
  );
}