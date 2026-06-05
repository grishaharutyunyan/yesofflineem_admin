"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import { getEvents, deleteEvent, type ApiEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  active:   { bg: "var(--success-bg)",  text: "var(--success)",  dot: "var(--success)" },
  draft:    { bg: "var(--warning-bg)",  text: "var(--warning)",  dot: "var(--warning)" },
  archived: { bg: "var(--surface-2)",   text: "var(--ink-3)",    dot: "var(--ink-4)"   },
};

const FILTERS = ["all", "active", "draft", "archived"];

export default function EventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const key = getToken()!;
    const params = filter !== "all" ? `status=${filter}` : "";
    const data = await getEvents(key, params);
    setEvents(data.items);
    setTotal(data.count);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function handleDelete(id: number, slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    setDeleting(id);
    try {
      await deleteEvent(getToken()!, id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setTotal((t) => t - 1);
    } finally {
      setDeleting(null);
    }
  }

  const totalBooked = events.reduce((a, e) => a + e.bookedCount, 0);
  const totalCapacity = events.reduce((a, e) => a + e.maxCapacity, 0);

  return (
    <>
      <style>{`
        .page-wrap {
          margin-left: var(--sidebar-w);
          padding: 2.25rem 2.5rem;
          min-height: 100vh;
        }
        .filter-pill {
          padding: 0.28rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: 100px;
          background: var(--surface);
          color: var(--ink-3);
          font-size: 0.775rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
          text-transform: capitalize;
          letter-spacing: 0.02em;
        }
        .filter-pill:hover { border-color: var(--ink); color: var(--ink); }
        .filter-pill.on { background: var(--ink); color: #fff; border-color: var(--ink); }
        .tbl { width: 100%; border-collapse: collapse; }
        .tbl th {
          padding: 0.6rem 1rem;
          text-align: left;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--ink-4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          background: var(--surface-2);
        }
        .tbl td {
          padding: 0.78rem 1rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.855rem;
          color: var(--ink);
          vertical-align: middle;
        }
        .tbl tbody tr:last-child td { border-bottom: none; }
        .tbl tbody tr { transition: background var(--transition); }
        .tbl tbody tr:hover td { background: #faf8f4; }
        .btn-edit {
          display: inline-block;
          padding: 0.28rem 0.65rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.765rem; font-weight: 500;
          color: var(--ink-2); background: var(--surface);
          cursor: pointer; transition: all var(--transition);
          text-decoration: none;
        }
        .btn-edit:hover { border-color: var(--ink-2); color: var(--ink); }
        .btn-del {
          padding: 0.28rem 0.65rem;
          border: 1px solid var(--danger-border);
          border-radius: var(--radius-sm);
          font-size: 0.765rem; font-weight: 500;
          color: var(--danger); background: var(--surface);
          cursor: pointer; transition: all var(--transition);
        }
        .btn-del:hover:not(:disabled) { background: var(--danger-bg); }
        .btn-del:disabled { opacity: 0.45; cursor: default; }
        .cap-bar { display: flex; align-items: center; gap: 0.45rem; }
        .cap-track { width: 42px; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
        .cap-fill { height: 100%; border-radius: 2px; background: var(--ink); transition: width 0.3s; }
        .primary-btn {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.52rem 1.1rem;
          background: var(--ink); color: #fff;
          border-radius: var(--radius-sm);
          font-size: 0.845rem; font-weight: 600;
          letter-spacing: 0.01em;
          transition: opacity var(--transition);
          text-decoration: none;
        }
        .primary-btn:hover { opacity: 0.82; }
      `}</style>
      <AuthGuard>
        <Nav />
        <main className="page-wrap">

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-cormorant, serif)",
                fontSize: "1.85rem", fontWeight: 600,
                lineHeight: 1, letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}>
                Events
              </h1>
              <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
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
          <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f} className={`filter-pill${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

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
            ) : events.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <div style={{ color: "var(--ink-3)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>No events found</div>
                <Link href="/events/new" style={{ fontSize: "0.8rem", color: "var(--ink-4)", textDecoration: "underline" }}>
                  Create your first event →
                </Link>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    {["ID", "Slug", "Title", "Status", "Date", "Capacity", ""].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => {
                    const pct = ev.maxCapacity > 0 ? (ev.bookedCount / ev.maxCapacity) * 100 : 0;
                    const sc = STATUS_CONFIG[ev.status] ?? STATUS_CONFIG.archived;
                    return (
                      <tr key={ev.id}>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                            {ev.id}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", color: "var(--ink-2)" }}>
                            {ev.slug}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ev.title.en}
                        </td>
                        <td>
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
                        <td>
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                            {ev.dates.start.slice(0, 10)}
                          </span>
                        </td>
                        <td>
                          <div className="cap-bar">
                            <div className="cap-track">
                              <div className="cap-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.775rem", color: "var(--ink-3)" }}>
                              {ev.bookedCount}/{ev.maxCapacity}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <Link href={`/events/${ev.id}`} className="btn-edit">Edit</Link>
                            <button
                              onClick={() => handleDelete(ev.id, ev.slug)}
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
            )}
          </div>
        </main>
      </AuthGuard>
    </>
  );
}
