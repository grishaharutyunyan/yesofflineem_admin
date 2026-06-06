"use client";
import type { EventHost } from "@/lib/api";
import ImageUpload from "./ImageUpload";

interface Props {
  value: EventHost;
  onChange: (val: EventHost) => void;
}

const sectionLabel: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "var(--ink-4)",
  marginBottom: "0.4rem",
  display: "block",
};

const colLabel: React.CSSProperties = {
  fontSize: "0.69rem",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  display: "block",
  marginBottom: "0.28rem",
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.875rem",
  background: "var(--surface)",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color 0.14s, box-shadow 0.14s",
  fontFamily: "inherit",
};

export default function HostEditor({ value, onChange }: Props) {
  function setLocale(field: "name" | "role", lang: "en" | "hy", val: string) {
    onChange({ ...value, [field]: { ...value[field], [lang]: val } });
  }

  return (
    <div>
      {/* Photo */}
      <div style={{ marginBottom: "1.1rem" }}>
        <ImageUpload
          label="Host photo"
          value={value.imageUrl ?? ""}
          onChange={(url) => onChange({ ...value, imageUrl: url || null })}
        />
      </div>

      {/* Name */}
      <div style={{ marginBottom: "0.85rem" }}>
        <span style={sectionLabel}>Name</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label style={colLabel}>EN</label>
            <input
              value={value.name.en}
              onChange={(e) => setLocale("name", "en", e.target.value)}
              placeholder="Jane Doe"
              style={inp}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.06)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={colLabel}>HY</label>
            <input
              value={value.name.hy}
              onChange={(e) => setLocale("name", "hy", e.target.value)}
              placeholder="Ջեյն Դո"
              style={inp}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.06)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      </div>

      {/* Role */}
      <div>
        <span style={sectionLabel}>Role / Title</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label style={colLabel}>EN</label>
            <input
              value={value.role.en}
              onChange={(e) => setLocale("role", "en", e.target.value)}
              placeholder="Yoga & Wellness Facilitator"
              style={inp}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.06)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={colLabel}>HY</label>
            <input
              value={value.role.hy}
              onChange={(e) => setLocale("role", "hy", e.target.value)}
              placeholder="Յոգայի ֆասիլիտատոր"
              style={inp}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.06)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}