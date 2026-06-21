"use client";

export interface IncludeItem {
  en: string;
  hy: string;
}

interface Props {
  value: IncludeItem[];
  onChange: (items: IncludeItem[]) => void;
}

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

export default function IncludesEditor({ value, onChange }: Props) {
  function add() {
    onChange([...value, { en: "", hy: "" }]);
  }

  function update(idx: number, field: "en" | "hy", val: string) {
    onChange(value.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: "0.65rem" }}>
          {value.map((item, idx) => (
            <div key={idx} style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "0.45rem",
              marginBottom: "0.4rem",
              alignItems: "center",
            }}>
              <input value={item.en} onChange={(e) => update(idx, "en", e.target.value)}
                placeholder="English" style={inp}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              <input value={item.hy} onChange={(e) => update(idx, "hy", e.target.value)}
                placeholder="Armenian" style={inp}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              <button type="button" onClick={() => remove(idx)} style={{
                background: "none", border: "1px solid #fca5a5", color: "#dc2626",
                borderRadius: "var(--radius-sm)", padding: "0.28rem 0.55rem",
                fontSize: "0.82rem", cursor: "pointer", flexShrink: 0, lineHeight: 1,
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        style={{
          padding: "0.48rem 1rem",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-sm)",
          background: "none", color: "var(--ink-3)",
          fontSize: "0.82rem", cursor: "pointer", transition: "all 0.14s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink-2)"; e.currentTarget.style.color = "var(--ink)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-3)"; }}
      >
        + Add item
      </button>
    </div>
  );
}