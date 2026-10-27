"use client";
import { useEffect, useRef, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
  dot?: string;
}

// Compact "Label: Value ▾" filter dropdown. The first option is the "no filter" choice.
export default function FilterSelect({ label, options, value, onChange }: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];
  const filtered = value !== options[0].value;

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(options[active].value); }
    else if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  }

  return (
    <div className="fs-root" ref={rootRef}>
      <style>{`
        .fs-root { position: relative; }
        .fs-trigger {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); box-shadow: var(--shadow); cursor: pointer;
          font-size: 0.85rem; color: var(--ink); white-space: nowrap;
          transition: border-color var(--transition);
        }
        .fs-trigger:hover { border-color: var(--border-2); }
        .fs-trigger.on { border-color: #c7d2fe; background: var(--accent-bg); }
        .fs-trigger[aria-expanded="true"] { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        .fs-label { color: var(--ink-3); }
        .fs-value { font-weight: 600; }
        .fs-trigger.on .fs-value { color: var(--accent-ink); }
        .fs-menu {
          position: absolute; top: calc(100% + 6px); left: 0; z-index: 50; min-width: 100%;
          padding: 0.3rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
          box-shadow: 0 12px 32px rgba(15,23,42,0.14); animation: fsIn 0.12s ease;
        }
        @keyframes fsIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        .fs-opt {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.6rem; border-radius: var(--radius-sm);
          font-size: 0.85rem; color: var(--ink); cursor: pointer; white-space: nowrap;
        }
        .fs-opt.active { background: var(--surface-2); }
        .fs-opt.sel { color: var(--accent-ink); font-weight: 600; }
        .fs-check { margin-left: auto; padding-left: 1rem; color: var(--accent); }
        .fs-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
      `}</style>
      <button
        type="button"
        className={`fs-trigger${filtered ? " on" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className="fs-label">{label}:</span>
        {current.dot && <span className="fs-dot" style={{ background: current.dot }} />}
        <span className="fs-value">{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden style={{ color: "var(--ink-3)" }}>
          <path d="M2 3.5L5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="fs-menu" role="listbox" aria-label={label}>
          {options.map((o, i) => (
            <div
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`fs-opt${i === active ? " active" : ""}${o.value === value ? " sel" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o.value)}
            >
              {o.dot && <span className="fs-dot" style={{ background: o.dot }} />}
              {o.label}
              {o.value === value && <span className="fs-check">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
