"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import type { ScheduleItem } from "@/lib/api";

interface Props {
  value: ScheduleItem[];
  onChange: (items: ScheduleItem[]) => void;
}

const labelSt: CSSProperties = {
  fontSize: "0.69rem",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--ink-4)",
  display: "block",
  marginBottom: "0.28rem",
};

const inp: CSSProperties = {
  width: "100%",
  padding: "0.45rem 0.65rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.845rem",
  background: "var(--surface)",
  color: "var(--ink)",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.14s",
};

function emptyItem(): ScheduleItem {
  return { time: "", label: { en: "", hy: "" }, sub: { en: "", hy: "" } };
}

// Detects whether a time string is structured (parseable as datetime/time)
function isStructuredTime(time: string): boolean {
  if (!time) return true;
  return /^(\d{4}-\d{2}-\d{2} )?\d{2}:\d{2}(–\d{2}:\d{2})?$/.test(time);
}

function parseStructuredTime(time: string): { date: string; start: string; end: string } {
  const dtFull = time.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})(?:–(\d{2}:\d{2}))?$/);
  if (dtFull) return { date: dtFull[1], start: dtFull[2], end: dtFull[3] ?? "" };
  const tOnly = time.match(/^(\d{2}:\d{2})(?:–(\d{2}:\d{2}))?$/);
  if (tOnly) return { date: "", start: tOnly[1], end: tOnly[2] ?? "" };
  return { date: "", start: "", end: "" };
}

function composeTime(date: string, start: string, end: string): string {
  if (date && start && end) return `${date} ${start}–${end}`;
  if (date && start) return `${date} ${start}`;
  if (!date && start && end) return `${start}–${end}`;
  if (!date && start) return start;
  if (date) return date;
  return "";
}

// Format stored time for the admin preview (EN only, simple)
function previewTime(time: string): string {
  const dtFull = time.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})(?:–(\d{2}:\d{2}))?$/);
  if (dtFull) {
    const d = new Date(dtFull[1] + "T12:00:00");
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    const range = dtFull[3] ? `${dtFull[2]}–${dtFull[3]}` : dtFull[2];
    return `${month} ${day}, ${range}`;
  }
  return time;
}

export default function ScheduleBuilder({ value, onChange }: Props) {
  const [freeMode, setFreeMode] = useState<Set<number>>(() => {
    const s = new Set<number>();
    value.forEach((item, i) => {
      if (!isStructuredTime(item.time)) s.add(i);
    });
    return s;
  });

  function toggleFreeMode(idx: number) {
    setFreeMode((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function update(idx: number, patch: Partial<ScheduleItem>) {
    onChange(value.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }

  function setLoc(idx: number, field: "label" | "sub", lang: "en" | "hy", val: string) {
    onChange(
      value.map((item, i) =>
        i === idx ? { ...item, [field]: { ...item[field], [lang]: val } } : item
      )
    );
  }

  function setTimeParts(idx: number, date: string, start: string, end: string) {
    update(idx, { time: composeTime(date, start, end) });
  }

  function remove(idx: number) {
    setFreeMode((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < idx) next.add(i);
        else if (i > idx) next.add(i - 1);
      });
      return next;
    });
    onChange(value.filter((_, i) => i !== idx));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setFreeMode((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i === idx) next.add(i - 1);
        else if (i === idx - 1) next.add(i + 1);
        else next.add(i);
      });
      return next;
    });
    const next = [...value];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }

  function moveDown(idx: number) {
    if (idx === value.length - 1) return;
    setFreeMode((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i === idx) next.add(i + 1);
        else if (i === idx + 1) next.add(i - 1);
        else next.add(i);
      });
      return next;
    });
    const next = [...value];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  }

  return (
    <div>
      {value.map((item, idx) => {
        const isFree = freeMode.has(idx);
        const parsed = parseStructuredTime(item.time);

        return (
          <div
            key={idx}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.85rem 1rem",
              marginBottom: "0.6rem",
              background: "var(--surface-2, #fafaf8)",
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.7rem" }}>
              <span style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em",
                textTransform: "uppercase", color: "var(--ink-4)",
                background: "var(--border)", padding: "0.12rem 0.42rem",
                borderRadius: "2px", flexShrink: 0,
              }}>
                #{idx + 1}
              </span>
              <div style={{ display: "flex", gap: "0.3rem", marginLeft: "auto", flexShrink: 0 }}>
                <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0}
                  style={{ ...arrowBtn, opacity: idx === 0 ? 0.3 : 1 }} title="Move up">↑</button>
                <button type="button" onClick={() => moveDown(idx)} disabled={idx === value.length - 1}
                  style={{ ...arrowBtn, opacity: idx === value.length - 1 ? 0.3 : 1 }} title="Move down">↓</button>
                <button type="button" onClick={() => remove(idx)} style={delBtn} title="Remove">×</button>
              </div>
            </div>

            {/* Time row */}
            <div style={{ marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.28rem" }}>
                <label style={labelSt}>Time / Date</label>
                <button
                  type="button"
                  onClick={() => toggleFreeMode(idx)}
                  style={{
                    fontSize: "0.65rem", color: "var(--ink-4)", background: "none",
                    border: "none", cursor: "pointer", padding: 0,
                    textDecoration: "underline", fontFamily: "inherit",
                  }}
                >
                  {isFree ? "Use date/time pickers" : "Free text"}
                </button>
              </div>

              {isFree ? (
                <input
                  value={item.time}
                  onChange={(e) => update(idx, { time: e.target.value })}
                  placeholder="Day 1  /  09:00  /  09:00–11:00"
                  style={inp}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.4rem", alignItems: "center" }}>
                    {/* Date */}
                    <input
                      type="date"
                      value={parsed.date}
                      onChange={(e) => setTimeParts(idx, e.target.value, parsed.start, parsed.end)}
                      style={inp}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                    {/* Start time */}
                    <input
                      type="time"
                      value={parsed.start}
                      onChange={(e) => setTimeParts(idx, parsed.date, e.target.value, parsed.end)}
                      style={{ ...inp, width: "auto", minWidth: 110 }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                    {/* End time */}
                    <input
                      type="time"
                      value={parsed.end}
                      onChange={(e) => setTimeParts(idx, parsed.date, parsed.start, e.target.value)}
                      style={{ ...inp, width: "auto", minWidth: 110 }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                  {item.time && (
                    <p style={{ fontSize: "0.68rem", color: "var(--ink-4)", marginTop: "0.2rem" }}>
                      Preview: <strong>{previewTime(item.time)}</strong>
                      {" · "}HY / EN formatted on the public site
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Label row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div>
                <label style={labelSt}>Label — EN</label>
                <input value={item.label.en}
                  onChange={(e) => setLoc(idx, "label", "en", e.target.value)}
                  placeholder="Arrival & settling in" style={inp}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={labelSt}>Label — HY</label>
                <input value={item.label.hy}
                  onChange={(e) => setLoc(idx, "label", "hy", e.target.value)}
                  placeholder="Ժամանում" style={inp}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
            </div>

            {/* Sub row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <label style={labelSt}>Details — EN</label>
                <input value={item.sub.en}
                  onChange={(e) => setLoc(idx, "sub", "en", e.target.value)}
                  placeholder="Evening welcome circle, shared dinner" style={inp}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={labelSt}>Details — HY</label>
                <input value={item.sub.hy}
                  onChange={(e) => setLoc(idx, "sub", "hy", e.target.value)}
                  style={inp}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...value, emptyItem()])}
        style={{
          width: "100%", padding: "0.6rem",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-sm)",
          background: "none", color: "var(--ink-3)",
          fontSize: "0.845rem", cursor: "pointer", transition: "all 0.14s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink-2)"; e.currentTarget.style.color = "var(--ink)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-3)"; }}
      >
        + Add schedule item
      </button>
    </div>
  );
}

const arrowBtn: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "0.22rem 0.48rem",
  fontSize: "0.78rem",
  cursor: "pointer",
  color: "var(--ink-3)",
  lineHeight: 1,
};

const delBtn: CSSProperties = {
  background: "none",
  border: "1px solid #fca5a5",
  color: "#dc2626",
  borderRadius: "var(--radius-sm)",
  padding: "0.22rem 0.52rem",
  fontSize: "0.85rem",
  cursor: "pointer",
  lineHeight: 1,
};