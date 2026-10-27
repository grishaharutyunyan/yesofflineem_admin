"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import EventParticipants from "@/components/EventParticipants";
import { getEvents, type ApiEvent } from "@/lib/api";

export default function DashboardPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      // ponytail: loads up to 1000 events and filters upcoming client-side; add a server date filter if that grows.
      const data = await getEvents(`range=${encodeURIComponent(JSON.stringify([1, 1000]))}`);
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
      .filter((e) => priceFilter === "all" || (priceFilter === "free") === (e.price === 0))
      .sort((a, b) => a.dates.start.localeCompare(b.dates.start));
  }, [events, priceFilter]);

  // Auto-select the first upcoming event once loaded, and keep selection valid.
  useEffect(() => {
    if (upcoming.length === 0) { setSelectedId(null); return; }
    if (selectedId === null || !upcoming.some((e) => e.id === selectedId)) {
      setSelectedId(upcoming[0].id);
    }
  }, [upcoming, selectedId]);

  const selected = upcoming.find((e) => e.id === selectedId) ?? null;
  const railRef = useRef<HTMLDivElement>(null);
  const scrollRail = (dir: 1 | -1) => railRef.current?.scrollBy({ left: dir * 560, behavior: "smooth" });

  return (
    <>
      <style>{`
        .ev-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
        .ev-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1rem 1.25rem 0.25rem; }
        .ev-head h2 { font-size: 1rem; font-weight: 650; color: var(--ink); }
        .ev-head p { font-size: 0.8rem; color: var(--ink-3); margin-top: 0.1rem; }
        .ev-tools { display: flex; align-items: center; gap: 0.75rem; }
        .rail-btn {
          width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid var(--border); border-radius: 50%; background: var(--surface); color: var(--ink-2); cursor: pointer;
          transition: all var(--transition);
        }
        .rail-btn:hover { border-color: var(--border-2); background: var(--surface-2); }
        .ev-rail { display: flex; gap: 0.85rem; overflow-x: auto; padding: 0.9rem 1.25rem 1.25rem; scroll-snap-type: x mandatory; scroll-padding: 1.25rem; }
        .ev-card {
          flex: 0 0 272px; scroll-snap-align: start; text-align: left; cursor: pointer;
          display: flex; flex-direction: column; gap: 0.85rem;
          padding: 0.9rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface);
          transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
        }
        .ev-card:hover { border-color: var(--border-2); box-shadow: var(--shadow-md); transform: translateY(-1px); }
        .ev-card.on { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        .ev-top { display: flex; gap: 0.8rem; align-items: flex-start; }
        .ev-date {
          flex: 0 0 auto; width: 48px; border-radius: 8px; overflow: hidden; text-align: center;
          border: 1px solid var(--border); background: var(--surface);
        }
        .ev-date-m { background: var(--surface-2); font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); padding: 0.15rem 0; border-bottom: 1px solid var(--border); }
        .ev-card.on .ev-date-m { background: var(--accent); color: #fff; border-bottom-color: var(--accent); }
        .ev-date-d { font-size: 1.2rem; font-weight: 700; color: var(--ink); padding: 0.2rem 0 0.25rem; line-height: 1.2; }
        .ev-title {
          font-size: 0.9rem; font-weight: 600; color: var(--ink); line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .ev-when { font-size: 0.76rem; color: var(--ink-3); margin-top: 0.2rem; }
        .chip { display: inline-flex; align-items: center; padding: 0.1rem 0.5rem; border-radius: 100px; font-size: 0.68rem; font-weight: 600; }
        .ev-cap-row { display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--ink-3); margin-bottom: 0.35rem; }
        .ev-cap-row b { color: var(--ink); font-weight: 600; }
        .cap-track { height: 6px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 100px; overflow: hidden; }
        .cap-fill { height: 100%; border-radius: 100px; background: var(--accent); }
        .ev-foot { display: flex; justify-content: space-between; align-items: center; }
      `}</style>
      <AuthGuard>
        <Nav />
        <main className="page-wrap">
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem", fontWeight: 650, lineHeight: 1,
              letterSpacing: "-0.01em", color: "var(--ink)",
            }}>
              Dashboard
            </h1>
            <p style={{ color: "var(--ink-3)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
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
            <>
              {/* Upcoming events */}
              <section className="ev-panel">
                <div className="ev-head">
                  <div>
                    <h2>Upcoming events</h2>
                    <p>Select an event to see who is coming</p>
                  </div>
                  <div className="ev-tools">
                    <div className="seg" role="group" aria-label="Filter by price">
                      {(["all", "free", "paid"] as const).map((f) => (
                        <button key={f} className={priceFilter === f ? "on" : ""} aria-pressed={priceFilter === f} onClick={() => setPriceFilter(f)}>
                          {f}
                        </button>
                      ))}
                    </div>
                    <button className="rail-btn" onClick={() => scrollRail(-1)} aria-label="Scroll events left">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button className="rail-btn" onClick={() => scrollRail(1)} aria-label="Scroll events right">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M5.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
                <div className="ev-rail" ref={railRef}>
                  {upcoming.map((ev) => {
                    const pct = ev.maxCapacity > 0 ? Math.min(100, Math.round((ev.bookedCount / ev.maxCapacity) * 100)) : 0;
                    const start = new Date(ev.dates.start.replace(" ", "T"));
                    const fillColor = pct >= 90 ? "var(--danger)" : pct >= 70 ? "var(--warning)" : "var(--accent)";
                    return (
                      <button
                        key={ev.id}
                        className={`ev-card${ev.id === selectedId ? " on" : ""}`}
                        onClick={() => setSelectedId(ev.id)}
                        aria-pressed={ev.id === selectedId}
                      >
                        <div className="ev-top">
                          <div className="ev-date">
                            <div className="ev-date-m">{start.toLocaleDateString("en-US", { month: "short" })}</div>
                            <div className="ev-date-d">{start.getDate()}</div>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="ev-title">{ev.title.en}</div>
                            <div className="ev-when">
                              {start.toLocaleDateString("en-US", { weekday: "short" })} · {ev.dates.start.slice(11, 16)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="ev-cap-row">
                            <span><b>{ev.bookedCount}</b> / {ev.maxCapacity} booked</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="cap-track"><div className="cap-fill" style={{ width: `${pct}%`, background: fillColor }} /></div>
                        </div>
                        <div className="ev-foot">
                          <span className="chip" style={ev.price === 0
                            ? { background: "var(--success-bg)", color: "var(--success)" }
                            : { background: "var(--surface-2)", color: "var(--ink-2)", border: "1px solid var(--border)" }}>
                            {ev.price === 0 ? "Free" : `${ev.price.toLocaleString("en-US")} AMD`}
                          </span>
                          {ev.status === "draft" && (
                            <span className="chip" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>Draft</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Participants of the selected event */}
              {selected && <EventParticipants key={selected.id} eventId={selected.id} eventTitle={selected.title.en} />}
            </>
          )}
        </main>
      </AuthGuard>
    </>
  );
}