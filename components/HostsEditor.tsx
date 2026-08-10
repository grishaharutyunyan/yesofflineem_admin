"use client";
import type { CSSProperties } from "react";
import type { EventHost } from "@/lib/api";
import HostEditor from "./HostEditor";

interface Props {
  value: EventHost[];
  onChange: (val: EventHost[]) => void;
}

function emptyHost(): EventHost {
  return { name: { en: "", hy: "" }, role: { en: "", hy: "" }, imageUrl: null };
}

export default function HostsEditor({ value, onChange }: Props) {
  function update(idx: number, host: EventHost) {
    onChange(value.map((h, i) => (i === idx ? host : h)));
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
      {value.map((host, idx) => (
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

          <HostEditor value={host} onChange={(v) => update(idx, v)} />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, emptyHost()])}
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
        + Add host
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
