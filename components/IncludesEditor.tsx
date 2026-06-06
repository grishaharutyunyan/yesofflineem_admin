"use client";
import { useMemo } from "react";

export interface IncludeItem {
  en: string;
  hy: string;
}

interface Props {
  value: IncludeItem[];
  onChange: (items: IncludeItem[]) => void;
}

const PREDEFINED: IncludeItem[] = [
  { en: "Morning yoga & breathwork", hy: "Առավոտյան յոգա և շնչառական պրակտիկա" },
  { en: "Forest foraging walk", hy: "Անտառային զբոսանք" },
  { en: "Fireside reflection evenings", hy: "Կրակի շուրջ մտորումների երեկոներ" },
  { en: "All plant-based meals", hy: "Ամբողջությամբ բուսական կերակուր" },
  { en: "Private accommodation", hy: "Մասնավոր կացարան" },
  { en: "Welcome & closing ceremony", hy: "Ողջույնի և փակման արարողություն" },
];

const ICONS: Record<string, string> = {
  "Morning yoga & breathwork": "🌅",
  "Forest foraging walk": "🌿",
  "Fireside reflection evenings": "🔥",
  "All plant-based meals": "🥗",
  "Private accommodation": "🏕️",
  "Welcome & closing ceremony": "✨",
};

const isPredefined = (en: string) => PREDEFINED.some((p) => p.en === en);

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
  const selectedEn = useMemo(() => new Set(value.filter((i) => isPredefined(i.en)).map((i) => i.en)), [value]);
  const customItems = useMemo(() => value.filter((i) => !isPredefined(i.en)), [value]);
  const predefinedItems = useMemo(() => value.filter((i) => isPredefined(i.en)), [value]);

  function togglePredefined(item: IncludeItem) {
    if (selectedEn.has(item.en)) {
      onChange([...predefinedItems.filter((i) => i.en !== item.en), ...customItems]);
    } else {
      onChange([...predefinedItems, item, ...customItems]);
    }
  }

  function addCustom() {
    onChange([...predefinedItems, ...customItems, { en: "", hy: "" }]);
  }

  function updateCustom(idx: number, field: "en" | "hy", val: string) {
    const updated = customItems.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
    onChange([...predefinedItems, ...updated]);
  }

  function removeCustom(idx: number) {
    onChange([...predefinedItems, ...customItems.filter((_, i) => i !== idx)]);
  }

  return (
    <div>
      {/* Predefined toggles */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.45rem",
        marginBottom: "1rem",
      }}>
        {PREDEFINED.map((item) => {
          const on = selectedEn.has(item.en);
          return (
            <button
              key={item.en}
              type="button"
              onClick={() => togglePredefined(item)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                padding: "0.6rem 0.8rem",
                border: `1.5px solid ${on ? "var(--ink)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                background: on ? "var(--ink)" : "var(--surface)",
                color: on ? "#fff" : "var(--ink-2)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.14s",
              }}
            >
              <span style={{ fontSize: "1.05rem", flexShrink: 0 }}>{ICONS[item.en]}</span>
              <div>
                <div style={{ fontSize: "0.815rem", fontWeight: 500, lineHeight: 1.25 }}>
                  {item.en}
                </div>
                <div style={{ fontSize: "0.71rem", opacity: 0.7, lineHeight: 1.2, marginTop: "0.1rem" }}>
                  {item.hy}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom items */}
      {customItems.length > 0 && (
        <div style={{ marginBottom: "0.65rem" }}>
          <div style={{
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.09em",
            textTransform: "uppercase", color: "var(--ink-4)",
            marginBottom: "0.4rem",
          }}>
            Custom
          </div>
          {customItems.map((item, idx) => (
            <div key={idx} style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "0.45rem",
              marginBottom: "0.4rem",
              alignItems: "center",
            }}>
              <input value={item.en} onChange={(e) => updateCustom(idx, "en", e.target.value)}
                placeholder="English" style={inp}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              <input value={item.hy} onChange={(e) => updateCustom(idx, "hy", e.target.value)}
                placeholder="Armenian" style={inp}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              <button type="button" onClick={() => removeCustom(idx)} style={{
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
        onClick={addCustom}
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
        + Add custom item
      </button>
    </div>
  );
}