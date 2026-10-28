"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import Pagination from "@/components/Pagination";
import EventParticipants from "@/components/EventParticipants";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import FilterSelect, { type FilterOption } from "@/components/FilterSelect";
import { getEvents, deleteEvent, updateEvent, type ApiEvent } from "@/lib/api";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  active:   { bg: "var(--success-bg)",  text: "var(--success)",  dot: "var(--success)" },
  draft:    { bg: "var(--warning-bg)",  text: "var(--warning)",  dot: "var(--warning)" },
  archived: { bg: "var(--surface-2)",   text: "var(--ink-3)",    dot: "var(--ink-4)"   },
};

const DATE_OPTIONS: FilterOption[] = [
  { value: "", label: "Any date" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];
const STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "Any status" },
  { value: "active", label: "Active", dot: "var(--success)" },
  { value: "draft", label: "Draft", dot: "var(--warning)" },
  { value: "archived", label: "Archived", dot: "var(--ink-4)" },
];

const PAGE_SIZE = 20;

export default function EventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [when, setWhen] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; slug: string; title: string } | null>(null);
  const [participantsOf, setParticipantsOf] = useState<ApiEvent | null>(null);
  const [promoTarget, setPromoTarget] = useState<ApiEvent | null>(null);

  // Close the participants drawer with Escape.
  useEffect(() => {
    if (!participantsOf) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setParticipantsOf(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [participantsOf]);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      // Backend range is [page, limit].
      const params = [
        `range=${encodeURIComponent(JSON.stringify([page, PAGE_SIZE]))}`,
        when ? `when=${when}` : "",
        status ? `status=${status}` : "",
      ].filter(Boolean).join("&");
      const data = await getEvents(params);
      setEvents(data.items);
      setTotal(data.count);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [when, status, page]);

  function handleDelete(id: number, slug: string, title: string) {
    setConfirmTarget({ id, slug, title });
  }

  // Refetch so the next event moves up into this page; step back if the page emptied.
  function afterDelete() {
    if (events.length === 1 && page > 1) setPage(page - 1);
    else load();
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    const { id, slug } = confirmTarget;
    setConfirmTarget(null);
    setDeleting(id);
    setDeleteError(null);
    try {
      await deleteEvent(id);
      afterDelete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('404')) {
        afterDelete();
      } else {
        setDeleteError(`Failed to delete "${slug}": ${msg}`);
      }
    } finally {
      setDeleting(null);
    }
  }

  async function confirmPromoToggle() {
    if (!promoTarget) return;
    const { id, promoEnabled, slug } = promoTarget;
    setPromoTarget(null);
    setDeleteError(null);
    try {
      await updateEvent(id, { promoEnabled: !promoEnabled });
      load();
    } catch (err: unknown) {
      setDeleteError(`Failed to update promo codes for "${slug}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const totalBooked = events.reduce((a, e) => a + e.bookedCount, 0);
  const totalCapacity = events.reduce((a, e) => a + e.maxCapacity, 0);

  return (
    <>
      <style>{`
        .cap-bar {
          display: flex; align-items: center; gap: 0.45rem;
          border: none; background: none; padding: 0.2rem 0.3rem; margin: -0.2rem -0.3rem;
          border-radius: var(--radius-sm); cursor: pointer;
        }
        .cap-bar:hover { background: var(--accent-bg); }
        .cap-bar:hover span { color: var(--accent-ink) !important; }
        .btn-people {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.3rem 0.7rem; border-radius: var(--radius-sm);
          border: 1px solid #c7d2fe; background: var(--accent-bg); color: var(--accent-ink);
          font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: background var(--transition);
        }
        .btn-people:hover { background: #e0e7ff; }
        .btn-promo {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);
          border: 1px solid var(--border); background: var(--surface); color: var(--ink-3);
          font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: all var(--transition);
        }
        .btn-promo:hover { border-color: var(--accent); color: var(--accent); }
        .btn-promo.on { border-color: var(--success); background: var(--success-bg); color: var(--success); }
        .btn-promo input { margin: 0; pointer-events: none; accent-color: var(--success); }
        .drawer-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.4); z-index: 900; animation: fadeIn 0.15s ease; }
        .drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 901;
          width: min(960px, 100%); background: var(--bg); box-shadow: -8px 0 32px rgba(15,23,42,0.18);
          display: flex; flex-direction: column; animation: drawerIn 0.2s ease;
        }
        .drawer-head {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          padding: 1rem 1.5rem; background: var(--surface); border-bottom: 1px solid var(--border);
        }
        .drawer-body { flex: 1; overflow-y: auto; padding: 0 1.5rem 2rem; }
        .drawer-close {
          width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface);
          color: var(--ink-3); cursor: pointer; font-size: 1.1rem;
        }
        .drawer-close:hover { color: var(--ink); border-color: var(--border-2); }
        @keyframes drawerIn { from { transform: translateX(24px); opacity: 0 } to { transform: none; opacity: 1 } }
        .cap-track { width: 56px; height: 5px; background: var(--border); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
        .cap-fill { height: 100%; border-radius: 2px; background: var(--accent); transition: width 0.3s; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
      <AuthGuard>
        <Nav />
        <main className="page-wrap">

          {/* Header */}
          <div className="page-header" style={{ marginBottom: "1.75rem" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem", fontWeight: 650,
                lineHeight: 1, letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}>
                Events
              </h1>
              <p style={{ color: "var(--ink-3)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
                {total} {total === 1 ? "event" : "events"}
                {totalCapacity > 0 && (
                  <span> — {totalBooked}/{totalCapacity} spots booked</span>
                )}
              </p>
            </div>
            <Link href="/events/new" className="primary-btn">
              <span style={{ fontSize: "1.1rem", lineHeight: 1, marginTop: "-1px" }}>+</span>
              New event
            </Link>
          </div>

          {/* Filters */}
          {/* Filters */}
          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
            <FilterSelect label="Date" options={DATE_OPTIONS} value={when} onChange={(v) => { setWhen(v); setPage(1); }} />
            <FilterSelect label="Status" options={STATUS_OPTIONS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
            {(when || status) && (
              <button
                onClick={() => { setWhen(""); setStatus(""); setPage(1); }}
                style={{ border: "none", background: "none", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Delete error banner */}
          {deleteError && (
            <div style={{
              marginBottom: "1rem",
              padding: "0.7rem 1rem",
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--danger)",
              fontSize: "0.82rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span>{deleteError}</span>
              <button
                onClick={() => setDeleteError(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 600, fontSize: "1rem", lineHeight: 1 }}
              >×</button>
            </div>
          )}

          {/* Table card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
          }}>
            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }} className="pulsing">
                Loading events…
              </div>
            ) : loadError ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <div style={{ color: "var(--danger)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{loadError}</div>
                <button onClick={load} style={{ fontSize: "0.8rem", color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Retry
                </button>
              </div>
            ) : events.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                {!when && !status ? (
                  <>
                    <div style={{ color: "var(--ink-3)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>No events yet</div>
                    <Link href="/events/new" style={{ fontSize: "0.8rem", color: "var(--ink-4)", textDecoration: "underline" }}>
                      Create your first event →
                    </Link>
                  </>
                ) : (
                  <>
                    <div style={{ color: "var(--ink-3)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                      No events match these filters
                    </div>
                    <button onClick={() => { setWhen(""); setStatus(""); setPage(1); }} style={{ fontSize: "0.8rem", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                      Clear filters →
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {["#", "Title", "Status", "Price", "Date", "Booked / Capacity", "Actions"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev, i) => {
                      const pct = ev.maxCapacity > 0 ? (ev.bookedCount / ev.maxCapacity) * 100 : 0;
                      const sc = STATUS_CONFIG[ev.status] ?? STATUS_CONFIG.archived;
                      return (
                        <tr key={ev.id}>
                          <td className="cell-idx">
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                              {(page - 1) * PAGE_SIZE + i + 1}
                            </span>
                          </td>
                          <td className="cell-main" style={{ fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <Link href={`/events/${ev.id}`} style={{ color: "var(--ink)" }}>{ev.title.en}</Link>
                          </td>
                          <td data-label="Status">
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "0.3rem",
                              background: sc.bg, color: sc.text,
                              padding: "0.18rem 0.55rem", borderRadius: 100,
                              fontSize: "0.71rem", fontWeight: 600,
                              letterSpacing: "0.04em", textTransform: "capitalize",
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                              {ev.status}
                            </span>
                          </td>
                          <td data-label="Price" style={{ fontSize: "0.78rem", color: "var(--ink-3)" }}>
                            {ev.price === 0 ? "Free" : `${ev.price.toLocaleString("en-US")} AMD`}
                          </td>
                          <td data-label="Date">
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                              {ev.dates.start.slice(0, 10)}
                            </span>
                          </td>
                          <td data-label="Booked / Capacity">
                            <button className="cap-bar" onClick={() => setParticipantsOf(ev)} title="View participants">
                              <div className="cap-track">
                                <div className="cap-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.775rem", color: "var(--ink-3)" }}>
                                {ev.bookedCount}/{ev.maxCapacity}
                              </span>
                            </button>
                          </td>
                          <td data-label="" className="cell-actions">
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button className="btn-people" onClick={() => setParticipantsOf(ev)} title="Participants" aria-label="Participants">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                                  <circle cx="5" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.3"/>
                                  <path d="M1.2 12c.4-2.1 1.9-3.3 3.8-3.3s3.4 1.2 3.8 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                  <path d="M9.5 2.6a2 2 0 010 3.8M10.6 8.9c1.2.4 2 1.4 2.2 3.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                </svg>
                              </button>
                              {ev.price > 0 && (
                                <button
                                  className={`btn-promo${ev.promoEnabled ? " on" : ""}`}
                                  onClick={() => setPromoTarget(ev)}
                                  title={ev.promoEnabled ? "Promo field shown on booking page" : "Promo field hidden on booking page"}
                                  aria-pressed={ev.promoEnabled}
                                  aria-label="Promo codes"
                                >
                                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                                    <path d="M1.5 7.6V2.2c0-.4.3-.7.7-.7h5.4l5 5a1 1 0 010 1.4l-4.1 4.1a1 1 0 01-1.4 0l-5.6-4.4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                                    <circle cx="4.6" cy="4.6" r="1" fill="currentColor"/>
                                  </svg>
                                  <input type="checkbox" checked={ev.promoEnabled} readOnly tabIndex={-1} aria-hidden />
                                </button>
                              )}
                              <Link href={`/events/${ev.id}`} className="btn-edit">Edit</Link>
                              <button
                                onClick={() => handleDelete(ev.id, ev.slug, ev.title.en)}
                                disabled={deleting === ev.id}
                                className="btn-del"
                              >
                                {deleting === ev.id ? "…" : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
              </div>
            )}
          </div>
        </main>

        {/* Participants drawer — works for past and upcoming events alike */}
        {participantsOf && (
          <>
            <div className="drawer-backdrop" onClick={() => setParticipantsOf(null)} />
            <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Participants of ${participantsOf.title.en}`}>
              <div className="drawer-head">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "1rem", fontWeight: 650, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {participantsOf.title.en}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", marginTop: "0.1rem" }}>
                    {participantsOf.dates.start.slice(0, 16)}
                    {participantsOf.dates.start.slice(0, 10) < new Date().toISOString().slice(0, 10) ? " · Past event" : " · Upcoming"}
                    {" · "}{participantsOf.bookedCount}/{participantsOf.maxCapacity} booked
                  </div>
                </div>
                <button className="drawer-close" onClick={() => setParticipantsOf(null)} aria-label="Close" autoFocus>×</button>
              </div>
              <div className="drawer-body">
                <EventParticipants key={participantsOf.id} eventId={participantsOf.id} eventTitle={participantsOf.title.en} />
              </div>
            </aside>
          </>
        )}

        {promoTarget && (
          <ConfirmDeleteModal
            kind="event"
            name={promoTarget.title.en}
            title={promoTarget.promoEnabled ? "Disable promo codes?" : "Enable promo codes?"}
            body={promoTarget.promoEnabled
              ? "will hide the promo code field on its booking page, and codes will be rejected at checkout."
              : "will show the promo code field on its booking page when a usable code exists."}
            confirmLabel={promoTarget.promoEnabled ? "Disable" : "Enable"}
            onCancel={() => setPromoTarget(null)}
            onConfirm={confirmPromoToggle}
          />
        )}

        {/* Delete confirmation modal */}
        {confirmTarget && (
          <ConfirmDeleteModal
            kind="event"
            name={confirmTarget.title}
            onCancel={() => setConfirmTarget(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AuthGuard>
    </>
  );
}
