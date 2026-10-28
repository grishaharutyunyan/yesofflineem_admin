"use client";
import { useEffect, useState } from "react";
import EventSelect from "@/components/EventSelect";
import { createPromoCode, type ApiEvent } from "@/lib/api";

// Validity templates: window starts now and lasts this many hours.
const TEMPLATES = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "24 hours", hours: 24 },
  { label: "48 hours", hours: 48 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
  { label: "30 days", hours: 720 },
];
const DISCOUNTS = [5, 10, 15, 20, 25, 50];

const emptyForm = { code: "", eventId: "", discountPercent: "10", maxUses: "", validFrom: "", validUntil: "" };

// Backend errors arrive as "POST /promo-codes → 400: {json}"; show just the message.
function errorText(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  try {
    const msg = JSON.parse(raw.slice(raw.indexOf("{"))).message;
    return Array.isArray(msg) ? msg.join(", ") : msg;
  } catch {
    return raw;
  }
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(8)), (n) => chars[n % chars.length]).join("");
}

// Date → "YYYY-MM-DDTHH:mm" in local time, the format <input type="datetime-local"> uses.
function toLocalInput(d: Date) {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function formatDuration(ms: number) {
  const h = Math.round(ms / 3600000);
  if (h < 1) return `${Math.round(ms / 60000)} min`;
  if (h < 48) return `${h} ${h === 1 ? "hour" : "hours"}`;
  const d = Math.floor(h / 24), rest = h % 24;
  return `${d} days${rest ? ` ${rest} h` : ""}`;
}

// Returns field → message for everything wrong with the form; empty object = valid.
function validate(f: typeof emptyForm) {
  const errs: Partial<Record<keyof typeof emptyForm, string>> = {};
  if (!/^[A-Z0-9_-]{3,32}$/.test(f.code)) errs.code = "3–32 characters: A–Z, 0–9, _ or -";
  const pct = Number(f.discountPercent);
  if (!Number.isInteger(pct) || pct < 1 || pct > 100) errs.discountPercent = "Whole number from 1 to 100";
  if (f.maxUses && (!Number.isInteger(Number(f.maxUses)) || Number(f.maxUses) < 1)) errs.maxUses = "Whole number ≥ 1, or empty";
  const from = f.validFrom ? new Date(f.validFrom).getTime() : null;
  const until = f.validUntil ? new Date(f.validUntil).getTime() : null;
  if (until != null && until <= Date.now()) errs.validUntil = "End must be in the future";
  else if (from != null && until != null && until <= from) errs.validUntil = "End must be after start";
  return errs;
}

export default function PromoCodeModal({ events, onClose, onCreated }: {
  events: ApiEvent[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ ...emptyForm, code: randomCode() });
  const [singleGuest, setSingleGuest] = useState(true);
  const [template, setTemplate] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const errs = validate(form);
  const show = (k: keyof typeof emptyForm) => (touched || form[k] !== emptyForm[k]) && errs[k];

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (k === "validFrom" || k === "validUntil") setTemplate(null);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  function applyTemplate(hours: number) {
    const now = new Date();
    now.setSeconds(0, 0);
    setTemplate(hours);
    setForm((f) => ({ ...f, validFrom: toLocalInput(now), validUntil: toLocalInput(new Date(now.getTime() + hours * 3600000)) }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errs).length) return;
    setError(null);
    setSaving(true);
    try {
      await createPromoCode({
        code: form.code,
        eventId: form.eventId ? Number(form.eventId) : null,
        discountPercent: Number(form.discountPercent),
        singleGuest,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
      });
      onCreated();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  const from = form.validFrom ? new Date(form.validFrom) : null;
  const until = form.validUntil ? new Date(form.validUntil) : null;
  const fmt = (d: Date) => d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const summary = !errs.validUntil && (from || until)
    ? `${from ? fmt(from) : "Now"} → ${until ? fmt(until) : "no end"}${from && until ? ` · ${formatDuration(until.getTime() - from.getTime())}` : ""}`
    : !from && !until ? "No time limit — valid until disabled" : null;

  return (
    <>
      <style>{`
        .pcm-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,23,42,0.45); backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: pcmFade 0.14s ease;
        }
        .pcm-box {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
          box-shadow: 0 24px 64px rgba(15,23,42,0.22);
          width: 100%; max-width: 560px; max-height: calc(100vh - 2rem);
          display: flex; flex-direction: column; overflow: hidden;
          animation: pcmUp 0.18s cubic-bezier(.2,.8,.2,1);
        }
        .pcm-head { padding: 1.25rem 1.5rem 1rem; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
        .pcm-title { font-family: var(--font-heading); font-size: 1.15rem; font-weight: 650; color: var(--ink); margin: 0; }
        .pcm-sub { font-size: 0.8rem; color: var(--ink-3); margin: 0.25rem 0 0; }
        .pcm-x { border: none; background: none; color: var(--ink-3); cursor: pointer; padding: 0.25rem; border-radius: 6px; line-height: 0; }
        .pcm-x:hover { background: var(--surface-2); color: var(--ink); }
        .pcm-body { padding: 1.25rem 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem; }
        .pcm-section { display: flex; flex-direction: column; gap: 0.5rem; }
        .pcm-lbl { font-size: 0.78rem; font-weight: 600; color: var(--ink-2); }
        .pcm-hint { font-size: 0.72rem; font-weight: 400; color: var(--ink-4); margin-left: 0.35rem; }
        .pcm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
        .pcm-input {
          width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 0.875rem; background: var(--surface); color: var(--ink); outline: none;
          transition: border-color 0.14s, box-shadow 0.14s;
        }
        .pcm-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        .pcm-input.bad { border-color: var(--danger); }
        .pcm-code { font-family: var(--font-mono, monospace); font-size: 1rem; font-weight: 600; letter-spacing: 0.06em; }
        .pcm-err { font-size: 0.74rem; color: var(--danger); }
        .pcm-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .pcm-chip {
          padding: 0.35rem 0.75rem; border: 1px solid var(--border); border-radius: 999px;
          background: var(--surface); color: var(--ink-2); font-size: 0.8rem; font-weight: 500; cursor: pointer;
          transition: all 0.12s;
        }
        .pcm-chip:hover { border-color: var(--accent); color: var(--accent); }
        .pcm-chip.on { background: var(--accent); border-color: var(--accent); color: #fff; }
        .pcm-summary {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.8rem;
          background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 0.8rem; color: var(--ink-2);
        }
        .pcm-foot { padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.6rem; background: var(--surface-2); }
        .pcm-cancel {
          padding: 0.55rem 1rem; border: 1px solid var(--border-2); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--ink-2); font-size: 0.85rem; font-weight: 500; cursor: pointer;
        }
        .pcm-cancel:hover { color: var(--ink); }
        @media (max-width: 520px) { .pcm-row { grid-template-columns: 1fr; } }
        @keyframes pcmFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pcmUp { from { transform: translateY(10px) scale(.98); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
      <div className="pcm-backdrop" onMouseDown={onClose}>
        <form className="pcm-box" role="dialog" aria-modal="true" aria-labelledby="pcm-title"
          onMouseDown={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
          <div className="pcm-head">
            <div>
              <p id="pcm-title" className="pcm-title">New promo code</p>
              <p className="pcm-sub">Pick a template or set the exact window.</p>
            </div>
            <button type="button" className="pcm-x" onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="pcm-body">
            <div className="pcm-section">
              <label className="pcm-lbl" htmlFor="pcm-code">Code</label>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <input id="pcm-code" autoFocus className={`pcm-input pcm-code${show("code") ? " bad" : ""}`} value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
                <button type="button" className="btn-edit" onClick={() => setForm((f) => ({ ...f, code: randomCode() }))}>Random</button>
              </div>
              {show("code") && <span className="pcm-err">{errs.code}</span>}
            </div>

            <div className="pcm-section">
              <label className="pcm-lbl" htmlFor="pcm-pct">Discount</label>
              <div className="pcm-chips">
                {DISCOUNTS.map((d) => (
                  <button key={d} type="button" className={`pcm-chip${form.discountPercent === String(d) ? " on" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, discountPercent: String(d) }))}>{d}%</button>
                ))}
                <input id="pcm-pct" type="number" min={1} max={100} className={`pcm-input${show("discountPercent") ? " bad" : ""}`}
                  style={{ width: 90 }} value={form.discountPercent} onChange={set("discountPercent")} aria-label="Custom discount %" />
              </div>
              {show("discountPercent") && <span className="pcm-err">{errs.discountPercent}</span>}
            </div>

            <div className="pcm-section">
              <span className="pcm-lbl">Discount applies to</span>
              <div className="pcm-chips" role="radiogroup">
                <button type="button" role="radio" aria-checked={singleGuest} className={`pcm-chip${singleGuest ? " on" : ""}`}
                  onClick={() => setSingleGuest(true)}>1 guest per order</button>
                <button type="button" role="radio" aria-checked={!singleGuest} className={`pcm-chip${!singleGuest ? " on" : ""}`}
                  onClick={() => setSingleGuest(false)}>Every guest</button>
              </div>
              <span className="pcm-hint" style={{ marginLeft: 0 }}>
                {singleGuest
                  ? "e.g. 3 guests at 10,000 AMD, 20% off → 8,000 + 10,000 + 10,000 = 28,000 AMD"
                  : "e.g. 3 guests at 10,000 AMD, 20% off → 24,000 AMD"}
              </span>
            </div>

            <div className="pcm-row">
              <div className="pcm-section">
                <label className="pcm-lbl">Event</label>
                <EventSelect events={events} value={form.eventId} onChange={(id) => setForm((f) => ({ ...f, eventId: id }))} />
              </div>
              <div className="pcm-section">
                <label className="pcm-lbl" htmlFor="pcm-max">Max uses<span className="pcm-hint">empty = unlimited</span></label>
                <input id="pcm-max" type="number" min={1} className={`pcm-input${show("maxUses") ? " bad" : ""}`}
                  value={form.maxUses} onChange={set("maxUses")} />
                {show("maxUses") && <span className="pcm-err">{errs.maxUses}</span>}
              </div>
            </div>

            <div className="pcm-section">
              <span className="pcm-lbl">Validity templates<span className="pcm-hint">starts now</span></span>
              <div className="pcm-chips">
                {TEMPLATES.map((t) => (
                  <button key={t.hours} type="button" className={`pcm-chip${template === t.hours ? " on" : ""}`}
                    onClick={() => applyTemplate(t.hours)}>{t.label}</button>
                ))}
                <button type="button" className={`pcm-chip${!form.validFrom && !form.validUntil ? " on" : ""}`}
                  onClick={() => { setTemplate(null); setForm((f) => ({ ...f, validFrom: "", validUntil: "" })); }}>No limit</button>
              </div>
            </div>

            <div className="pcm-row">
              <div className="pcm-section">
                <label className="pcm-lbl" htmlFor="pcm-from">Valid from<span className="pcm-hint">empty = now</span></label>
                <input id="pcm-from" type="datetime-local" className="pcm-input" value={form.validFrom} onChange={set("validFrom")} />
              </div>
              <div className="pcm-section">
                <label className="pcm-lbl" htmlFor="pcm-until">Valid until<span className="pcm-hint">empty = no end</span></label>
                <input id="pcm-until" type="datetime-local" className={`pcm-input${errs.validUntil ? " bad" : ""}`}
                  min={form.validFrom || undefined} value={form.validUntil} onChange={set("validUntil")} />
              </div>
            </div>
            {errs.validUntil
              ? <span className="pcm-err" style={{ marginTop: "-0.75rem" }}>{errs.validUntil}</span>
              : summary && (
                <div className="pcm-summary">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 4.75V8l2.25 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {summary}
                </div>
              )}

            {error && (
              <div role="alert" style={{ padding: "0.6rem 0.85rem", fontSize: "0.82rem", color: "var(--danger)", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-sm)" }}>
                {error}
              </div>
            )}
          </div>

          <div className="pcm-foot">
            <button type="button" className="pcm-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Creating…" : "Create code"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
