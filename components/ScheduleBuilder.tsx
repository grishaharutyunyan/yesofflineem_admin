"use client";
import type { ScheduleItem } from "@/lib/api";

interface Props {
  value: ScheduleItem[];
  onChange: (items: ScheduleItem[]) => void;
}

const labelSt: React.CSSProperties = {
  fontSize: "0.69rem",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--ink-4)",
  display: "block",
  marginBottom: "0.28rem",
};

const inp: React.CSSProperties = {
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

export default function ScheduleBuilder({ value, onChange }: Props) {
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

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...value];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }

  function moveDown(idx: number) {
    if (idx === value.length - 1) return;
    const next = [...value];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  }

  return (
    <div>
      {value.map((item, idx) => (
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
            <input
              value={item.time}
              onChange={(e) => update(idx, { time: e.target.value })}
              placeholder="Day 1  /  09:00  /  09:00–11:00"
              style={{ ...inp, flex: 1 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
              <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0}
                style={{ ...arrowBtn, opacity: idx === 0 ? 0.3 : 1 }} title="Move up">↑</button>
              <button type="button" onClick={() => moveDown(idx)} disabled={idx === value.length - 1}
                style={{ ...arrowBtn, opacity: idx === value.length - 1 ? 0.3 : 1 }} title="Move down">↓</button>
              <button type="button" onClick={() => remove(idx)} style={delBtn} title="Remove">×</button>
            </div>
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
      ))}

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

const arrowBtn: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "0.22rem 0.48rem",
  fontSize: "0.78rem",
  cursor: "pointer",
  color: "var(--ink-3)",
  lineHeight: 1,
};

const delBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid #fca5a5",
  color: "#dc2626",
  borderRadius: "var(--radius-sm)",
  padding: "0.22rem 0.52rem",
  fontSize: "0.85rem",
  cursor: "pointer",
  lineHeight: 1,
};