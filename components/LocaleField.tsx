"use client";

interface Props {
  label: string;
  enValue: string;
  hyValue: string;
  onChange: (lang: "en" | "hy", value: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}

const baseInput: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.875rem",
  background: "var(--surface)",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color 0.14s, box-shadow 0.14s",
  lineHeight: 1.55,
  fontFamily: "inherit",
};

export default function LocaleField({ label, enValue, hyValue, onChange, multiline = false, rows = 3, hint }: Props) {
  const Tag = multiline ? "textarea" : "input";

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-2)", letterSpacing: "0.02em" }}>
          {label}
        </span>
        {hint && (
          <span style={{ fontSize: "0.71rem", color: "var(--ink-4)" }}>{hint}</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
        {(["en", "hy"] as const).map((lang) => (
          <div key={lang}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.28rem" }}>
              <span style={{
                fontSize: "0.59rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#fff",
                background: lang === "en" ? "var(--ink)" : "var(--ink-3)",
                padding: "0.12rem 0.38rem",
                borderRadius: 3,
              }}>
                {lang}
              </span>
            </div>
            <Tag
              value={lang === "en" ? enValue : hyValue}
              onChange={(e) => onChange(lang, e.target.value)}
              rows={multiline ? rows : undefined}
              style={{
                ...baseInput,
                resize: multiline ? "vertical" : undefined,
                minHeight: multiline ? "76px" : undefined,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ink)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
