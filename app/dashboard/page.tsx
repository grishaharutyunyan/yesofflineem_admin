"use client";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import EventParticipants from "@/components/EventParticipants";
import { getEvents, type ApiEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";

const STATUS_DOT: Record<string, string> = {
  active: "var(--success)",
  draft: "var(--warning)",
  archived: "var(--ink-4)",
};

export default function DashboardPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getEvents(getToken()!);
      setEvents(data.items);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events
      .filter((e) => e.status !== "archived" && e.dates.start.slice(0, 10) >= today)
      .sort((a, b) => a.dates.start.localeCompare(b.dates.start));
  }, [events]);

  // Auto-select the first upcoming event once loaded, and keep selection valid.
  useEffect(() => {
    if (upcoming.length === 0) { setSelectedId(null); return; }
    if (selectedId === null || !upcoming.some((e) => e.id === selectedId)) {
      setSelectedId(upcoming[0].id);
    }
  }, [upcoming, selectedId]);

  const selected = upcoming.find((e) => e.id === selectedId) ?? null;

  return (
    <>
      <style>{`
        .dash-grid { display: grid; grid-template-columns: 340px 1fr; gap: 1.5rem; align-items: start; }
        @media (max-width: 860px) { .dash-grid { grid-template-columns: 1fr; } }
        .ev-row {
          display: block; width: 100%; text-align: left;
          padding: 0.85rem 1rem; border: none; background: transparent;
          border-bottom: 1px solid var(--border); cursor: pointer;
          transition: background var(--transition);
        }
        .ev-row:last-child { border-bottom: none; }
        .ev-row:hover { background: #faf8f4; }
        .ev-row.on { background: var(--surface-2); }
        .ev-row.on .ev-title { color: var(--ink); }
        .ev-title { font-size: 0.9rem; font-weight: 500; color: var(--ink-2); margin-bottom: 0.25rem; }
        .ev-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--ink-4); font-family: var(--font-mono, monospace); }
        .cap-track { width: 42px; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
        .cap-fill { height: 100%; border-radius: 2px; background: var(--ink); }
      `}</style>
      <AuthGuard>
        <Nav />
        <main className="page-wrap">
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "1.85rem", fontWeight: 600, lineHeight: 1,
              letterSpacing: "-0.01em", color: "var(--ink)",
            }}>
              Dashboard
            </h1>
            <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
              {loading ? "Loading…" : `${upcoming.length} upcoming ${upcoming.length === 1 ? "event" : "events"}`}
            </p>
          </div>

          {loading ? (
            <div className="pulsing" style={{ color: "var(--ink-4)", fontSize: "0.875rem", padding: "2rem 0" }}>
              Loading…
            </div>
          ) : loadError ? (
            <div style={{ padding: "4rem", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <div style={{ color: "var(--danger)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{loadError}</div>
              <button onClick={load} style={{ fontSize: "0.8rem", color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Retry
              </button>
            </div>
          ) : upcoming.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--ink-3)", fontSize: "0.875rem" }}>
              No upcoming events
            </div>
          ) : (
            <div className="dash-grid">
              {/* Upcoming events panel */}
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow)",
              }}>
                <div style={{
                  padding: "0.6rem 1rem", fontSize: "0.68rem", fontWeight: 600,
                  color: "var(--ink-4)", letterSpacing: "0.08em", textTransform: "uppercase",
                  borderBottom: "1px solid var(--border)", background: "var(--surface-2)",
                }}>
                  Upcoming events
                </div>
                {upcoming.map((ev) => {
                  const pct = ev.maxCapacity > 0 ? (ev.bookedCount / ev.maxCapacity) * 100 : 0;
                  return (
                    <button
                      key={ev.id}
                      className={`ev-row${ev.id === selectedId ? " on" : ""}`}
                      onClick={() => setSelectedId(ev.id)}
                    >
                      <div className="ev-title">{ev.title.en}</div>
                      <div className="ev-meta">
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_DOT[ev.status] ?? "var(--ink-4)", flexShrink: 0 }} />
                        <span>{ev.dates.start.slice(0, 10)}</span>
                        <span className="cap-track"><span className="cap-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></span>
                        <span>{ev.bookedCount}/{ev.maxCapacity}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Participants panel */}
              <div>
                {selected && (
                  <>
                    <div style={{ marginBottom: "-1.5rem" }} />
                    <EventParticipants key={selected.id} eventId={selected.id} />
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </AuthGuard>
    </>
  );
}