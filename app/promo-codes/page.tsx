"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import PromoCodeModal from "@/components/PromoCodeModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import {
  getPromoCodes, setPromoCodeActive, deletePromoCode, getEvents,
  type ApiPromoCode, type ApiEvent,
} from "@/lib/api";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function PromoCodesPage() {
  const [promos, setPromos] = useState<ApiPromoCode[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ApiPromoCode | null>(null);

  async function load() {
    setLoading(true);
    try {
      setPromos(await getPromoCodes());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    getEvents(`range=${encodeURIComponent(JSON.stringify([1, 1000]))}`).then((d) => setEvents(d.items)).catch(() => {});
  }, []);

  function toggleReveal(id: number) {
    setRevealed((r) => {
      const next = new Set(r);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function copy(p: ApiPromoCode) {
    await navigator.clipboard.writeText(p.code);
    setCopied(p.id);
    setTimeout(() => setCopied((c) => (c === p.id ? null : c)), 1500);
  }

  async function toggle(p: ApiPromoCode) {
    const updated = await setPromoCodeActive(p.id, !p.active);
    setPromos((list) => list.map((x) => (x.id === p.id ? updated : x)));
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    const { id } = confirmTarget;
    setConfirmTarget(null);
    await deletePromoCode(id);
    setPromos((list) => list.filter((x) => x.id !== id));
  }

  const eventName = (id: number | null) =>
    id == null ? "All events" : events.find((e) => e.id === id)?.title.en ?? `#${id}`;

  const statusOf = (p: ApiPromoCode) => {
    const now = new Date().toISOString();
    if (!p.active) return { label: "Disabled", color: "var(--ink-4)" };
    if (p.validUntil && p.validUntil < now) return { label: "Expired", color: "var(--warning)" };
    if (p.validFrom && p.validFrom > now) return { label: "Scheduled", color: "var(--accent)" };
    if (p.maxUses != null && p.usedCount >= p.maxUses) return { label: "Used up", color: "var(--warning)" };
    return { label: "Active", color: "var(--success)" };
  };

  return (
    <AuthGuard>
      <Nav />
      <style>{`
        .code-chip {
          display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.5rem;
          border: 1px dashed var(--border-2); border-radius: var(--radius-sm); background: var(--surface-2);
          font-family: var(--font-mono, monospace); font-weight: 600; font-size: 0.85rem; letter-spacing: 0.05em;
          color: var(--ink); cursor: pointer;
        }
        .code-chip svg { color: var(--ink-3); flex-shrink: 0; }
        .code-chip:hover { border-color: var(--accent); }
        .code-copy {
          display: inline-flex; padding: 0.3rem; border: 1px solid transparent; border-radius: var(--radius-sm);
          background: none; color: var(--ink-3); cursor: pointer; line-height: 0;
        }
        .code-copy:hover { border-color: var(--border); color: var(--accent); }
        .code-copy.done { color: var(--success); }
      `}</style>
      <main className="page-wrap">
        <div className="page-header" style={{ marginBottom: "1.75rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 650, lineHeight: 1, letterSpacing: "-0.01em" }}>
              Promo codes
            </h1>
            <p style={{ color: "var(--ink-3)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
              {promos.length} {promos.length === 1 ? "code" : "codes"}
            </p>
          </div>
          <button className="primary-btn" onClick={() => setCreating(true)}>+ New promo code</button>
        </div>

        {/* List */}
        <div className="card" style={{ overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }} className="pulsing">
              Loading promo codes…
            </div>
          ) : promos.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--ink-3)", fontSize: "0.875rem" }}>No promo codes yet</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>{["Code", "Discount", "Event", "Used", "Valid", "Status", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {promos.map((p) => {
                    const st = statusOf(p);
                    return (
                      <tr key={p.id}>
                        <td className="cell-main">
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                            <button type="button" className="code-chip" onClick={() => toggleReveal(p.id)}
                              title={revealed.has(p.id) ? "Click to hide" : "Click to show"}
                              aria-label={revealed.has(p.id) ? `Hide code ${p.code}` : "Show code"}>
                              {revealed.has(p.id) ? p.code : "•".repeat(p.code.length)}
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                                <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                                {revealed.has(p.id) && <path d="M2.5 13.5l11-11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>}
                              </svg>
                            </button>
                            <button type="button" className={`code-copy${copied === p.id ? " done" : ""}`} onClick={() => copy(p)}
                              title="Copy code" aria-label={copied === p.id ? "Copied" : "Copy code"}>
                              {copied === p.id ? (
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                                  <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                                  <path d="M10.5 5.5V3.5a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td data-label="Discount">{p.discountPercent}%</td>
                        <td data-label="Event" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eventName(p.eventId)}</td>
                        <td data-label="Used">{p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ""}</td>
                        <td data-label="Valid" style={{ fontSize: "0.78rem", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                          {p.validFrom ? fmtDate(p.validFrom) : "—"} → {p.validUntil ? fmtDate(p.validUntil) : "—"}
                        </td>
                        <td data-label="Status"><span style={{ color: st.color, fontWeight: 600, fontSize: "0.8rem" }}>{st.label}</span></td>
                        <td data-label="" className="cell-actions">
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button className="btn-edit" onClick={() => toggle(p)}>{p.active ? "Disable" : "Enable"}</button>
                            <button className="btn-del" onClick={() => setConfirmTarget(p)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {confirmTarget && (
        <ConfirmDeleteModal kind="promo code" name={revealed.has(confirmTarget.id) ? confirmTarget.code : "This code"} onCancel={() => setConfirmTarget(null)} onConfirm={confirmDelete} />
      )}
      {creating && (
        <PromoCodeModal events={events} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />
      )}
    </AuthGuard>
  );
}
