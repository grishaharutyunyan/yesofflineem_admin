"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiEvent } from "@/lib/api";

// Searchable event picker grouped into Upcoming / Past. value "" means all events.
export default function EventSelect({ events, value, onChange }: {
  events: ApiEvent[];
  value: string;
  onChange: (eventId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = events.find((e) => String(e.id) === value) ?? null;

  // Flat option list ("" = All events) plus group headings, filtered by the search text.
  const { options, groups } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const q = query.trim().toLowerCase();
    const match = (e: ApiEvent) => !q || e.title.en.toLowerCase().includes(q) || e.dates.start.includes(q);
    const byStart = [...events].filter(match).sort((a, b) => a.dates.start.localeCompare(b.dates.start));
    const upcoming = byStart.filter((e) => e.dates.start.slice(0, 10) >= today);
    const past = byStart.filter((e) => e.dates.start.slice(0, 10) < today).reverse();
    const all: (ApiEvent | null)[] = q ? [] : [null];
    return {
      options: [...all, ...upcoming, ...past],
      groups: [
        { label: "Upcoming", items: upcoming },
        { label: "Past", items: past },
      ].filter((g) => g.items.length > 0),
    };
  }, [events, query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function pick(opt: ApiEvent | null) {
    onChange(opt ? String(opt.id) : "");
    close();
  }

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // On open: focus search and highlight the current selection.
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const idx = options.findIndex((o) => (o ? String(o.id) : "") === value);
    setActive(Math.max(0, idx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (options[active] !== undefined) pick(options[active]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  }

  const renderOption = (ev: ApiEvent) => {
    const idx = options.indexOf(ev);
    const start = new Date(ev.dates.start.replace(" ", "T"));
    return (
      <div
        key={ev.id}
        data-idx={idx}
        role="option"
        aria-selected={String(ev.id) === value}
        className={`es-opt${idx === active ? " active" : ""}${String(ev.id) === value ? " sel" : ""}`}
        onMouseEnter={() => setActive(idx)}
        onClick={() => pick(ev)}
      >
        <div className="es-date">
          <span className="es-date-m">{start.toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="es-date-d">{start.getDate()}</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="es-title">{ev.title.en}</div>
          <div className="es-sub">
            {start.toLocaleDateString("en-US", { weekday: "short", year: "numeric" })} · {ev.bookedCount}/{ev.maxCapacity} booked
          </div>
        </div>
        {String(ev.id) === value && <span className="es-check">✓</span>}
      </div>
    );
  };

  return (
    <div className="es-root" ref={rootRef}>
      <style>{`
        .es-root { position: relative; }
        .es-trigger {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 0.75rem 0.5rem 0.85rem; min-width: 220px; max-width: 320px;
          border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); color: var(--ink); font-size: 0.85rem;
          box-shadow: var(--shadow); cursor: pointer; text-align: left;
          transition: border-color var(--transition);
        }
        .es-trigger:hover { border-color: var(--border-2); }
        .es-trigger.on { border-color: #c7d2fe; background: var(--accent-bg); color: var(--accent-ink); font-weight: 500; }
        .es-trigger[aria-expanded="true"] { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        .es-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .es-clear {
          display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px;
          border-radius: 50%; border: none; background: #c7d2fe; color: var(--accent-ink); font-size: 0.75rem; cursor: pointer;
        }
        .es-clear:hover { background: var(--accent); color: #fff; }
        .es-panel {
          position: absolute; top: calc(100% + 6px); left: 0; z-index: 50;
          width: 360px; max-width: calc(100vw - 2rem);
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
          box-shadow: 0 12px 32px rgba(15,23,42,0.14); overflow: hidden;
          animation: esIn 0.12s ease;
        }
        @keyframes esIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        .es-search { padding: 0.6rem; border-bottom: 1px solid var(--border); }
        .es-search input {
          width: 100%; padding: 0.5rem 0.7rem; border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 0.85rem; background: var(--surface-2); color: var(--ink); outline: none;
        }
        .es-search input:focus { border-color: var(--accent); background: var(--surface); }
        .es-list { max-height: 340px; overflow-y: auto; padding: 0.35rem; }
        .es-group { padding: 0.55rem 0.6rem 0.3rem; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-4); }
        .es-opt {
          display: flex; align-items: center; gap: 0.65rem; padding: 0.5rem 0.6rem;
          border-radius: var(--radius-sm); cursor: pointer;
        }
        .es-opt.active { background: var(--surface-2); }
        .es-opt.sel { background: var(--accent-bg); }
        .es-date {
          flex: 0 0 auto; width: 38px; border: 1px solid var(--border); border-radius: 6px; overflow: hidden;
          display: flex; flex-direction: column; text-align: center; background: var(--surface);
        }
        .es-date-m { font-size: 0.56rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3); background: var(--surface-2); border-bottom: 1px solid var(--border); padding: 1px 0; }
        .es-opt.sel .es-date-m { background: var(--accent); color: #fff; border-bottom-color: var(--accent); }
        .es-date-d { font-size: 0.9rem; font-weight: 700; color: var(--ink); line-height: 1.5; }
        .es-title { font-size: 0.85rem; font-weight: 500; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .es-opt.sel .es-title { color: var(--accent-ink); font-weight: 600; }
        .es-sub { font-size: 0.72rem; color: var(--ink-4); margin-top: 1px; }
        .es-check { color: var(--accent); font-weight: 700; font-size: 0.85rem; }
        .es-all-icon {
          flex: 0 0 auto; width: 38px; height: 38px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
          background: var(--surface-2); border: 1px solid var(--border); color: var(--ink-3);
        }
        .es-empty { padding: 1.5rem; text-align: center; font-size: 0.82rem; color: var(--ink-4); }
        @media (max-width: 768px) { .es-root, .es-trigger { width: 100%; max-width: none; } }
      `}</style>

      <button
        type="button"
        className={`es-trigger${selected ? " on" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => { if (!open && (e.key === "ArrowDown" || e.key === "Enter")) { e.preventDefault(); setOpen(true); } }}
      >
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden style={{ flexShrink: 0 }}>
          <rect x="1.5" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5 1.5v2M10 1.5v2M1.5 6.5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="es-label">{selected ? selected.title.en : "All events"}</span>
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            className="es-clear"
            aria-label="Clear event filter"
            onClick={(e) => { e.stopPropagation(); pick(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); pick(null); } }}
          >×</span>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden style={{ flexShrink: 0, color: "var(--ink-3)" }}>
            <path d="M2 3.5L5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="es-panel" onKeyDown={onKeyDown}>
          <div className="es-search">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events or dates…"
              aria-label="Search events"
            />
          </div>
          <div className="es-list" role="listbox" ref={listRef} aria-label="Events">
            {!query.trim() && (
              <div
                data-idx={0}
                role="option"
                aria-selected={value === ""}
                className={`es-opt${active === 0 ? " active" : ""}${value === "" ? " sel" : ""}`}
                onMouseEnter={() => setActive(0)}
                onClick={() => pick(null)}
              >
                <div className="es-all-icon">
                  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden>
                    <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="es-title">All events</div>
                  <div className="es-sub">{events.length} events</div>
                </div>
                {value === "" && <span className="es-check">✓</span>}
              </div>
            )}
            {groups.map((g) => (
              <div key={g.label} role="group" aria-label={g.label}>
                <div className="es-group">{g.label} · {g.items.length}</div>
                {g.items.map(renderOption)}
              </div>
            ))}
            {groups.length === 0 && query.trim() && <div className="es-empty">No events match “{query}”</div>}
          </div>
        </div>
      )}
    </div>
  );
}
