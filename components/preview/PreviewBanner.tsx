"use client";

import Link from "next/link";

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "var(--success-bg)", text: "var(--success)", dot: "var(--success)" },
  draft: { bg: "var(--warning-bg)", text: "var(--warning)", dot: "var(--warning)" },
  archived: { bg: "var(--surface-2)", text: "var(--ink-3)", dot: "var(--ink-4)" },
};

export const PREVIEW_BANNER_HEIGHT = 44;

export default function PreviewBanner({
  status,
  lang,
  onLangChange,
  backHref,
}: {
  status: string;
  lang: "en" | "hy";
  onLangChange: (lang: "en" | "hy") => void;
  backHref: string;
}) {
  const sc = STATUS_COLORS[status] ?? STATUS_COLORS.archived;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        height: PREVIEW_BANNER_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        background: "#1a1a1a",
        borderBottom: "1px solid #000",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>
          Preview mode
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            background: sc.bg,
            color: sc.text,
            padding: "0.18rem 0.55rem",
            borderRadius: 100,
            fontSize: "0.71rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "capitalize",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
          {status}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
          {(["en", "hy"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLangChange(l)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: lang === l ? "#fff" : "#8a8a8a",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
              }}
            >
              {l === "en" ? "EN" : "ՀԱՅ"}
            </button>
          ))}
        </div>
        <Link
          href={backHref}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "#fff",
            textDecoration: "underline",
          }}
        >
          ← Back to edit
        </Link>
      </div>
    </div>
  );
}
