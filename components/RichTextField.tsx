"use client";

import { useRef } from "react";
import { renderRichText } from "@/lib/richText";

interface Props {
  label: string;
  enValue: string;
  hyValue: string;
  onChange: (lang: "en" | "hy", value: string) => void;
  hint?: string;
  rows?: number;
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
  resize: "vertical",
};

const toolbarButtonStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--ink-2)",
  borderRadius: "var(--radius-sm)",
  width: "1.7rem",
  height: "1.7rem",
  fontSize: "0.78rem",
  lineHeight: 1,
  cursor: "pointer",
};

type ToolbarAction = "bold" | "italic" | "bullet" | "numbered" | "newline" | "paragraph";

const TOOLBAR_ITEMS: { action: ToolbarAction; icon: string; label: string; style?: React.CSSProperties }[] = [
  { action: "bold", icon: "B", label: "Bold", style: { fontWeight: 700 } },
  { action: "italic", icon: "I", label: "Italic", style: { fontStyle: "italic" } },
  { action: "bullet", icon: "•", label: "Bulleted list" },
  { action: "numbered", icon: "1.", label: "Numbered list", style: { fontSize: "0.68rem" } },
  { action: "newline", icon: "⏎", label: "New line" },
  { action: "paragraph", icon: "¶", label: "New paragraph" },
];

function applyInlineWrap(value: string, start: number, end: number, marker: string) {
  const selected = value.slice(start, end) || "text";
  const before = value.slice(0, start);
  const after = value.slice(end);
  const inserted = `${marker}${selected}${marker}`;
  return {
    value: `${before}${inserted}${after}`,
    selStart: before.length + marker.length,
    selEnd: before.length + marker.length + selected.length,
  };
}

function applyNewLine(value: string, start: number, end: number) {
  const before = value.slice(0, start);
  const after = value.slice(end);
  return {
    value: `${before}\n${after}`,
    selStart: before.length + 1,
    selEnd: before.length + 1,
  };
}

function applyParagraphBreak(value: string, start: number, end: number) {
  const before = value.slice(0, start);
  const after = value.slice(end);
  return {
    value: `${before}\n\n${after}`,
    selStart: before.length + 2,
    selEnd: before.length + 2,
  };
}

function applyLinePrefix(value: string, start: number, end: number, kind: "bullet" | "numbered") {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndIdx = value.indexOf("\n", end);
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;

  const before = value.slice(0, lineStart);
  const after = value.slice(lineEnd);
  const targetLines = value.slice(lineStart, lineEnd).split("\n");

  const bulletRe = /^[-*]\s+/;
  const numberedRe = /^\d+[.)]\s+/;
  const alreadyApplied = targetLines.every((l) =>
    kind === "bullet" ? bulletRe.test(l) : numberedRe.test(l)
  );

  const nextLines = targetLines.map((line, i) => {
    const stripped = line.replace(bulletRe, "").replace(numberedRe, "");
    if (alreadyApplied) return stripped;
    return kind === "bullet" ? `- ${stripped}` : `${i + 1}. ${stripped}`;
  });

  const inserted = nextLines.join("\n");
  return {
    value: `${before}${inserted}${after}`,
    selStart: before.length,
    selEnd: before.length + inserted.length,
  };
}

export default function RichTextField({ label, enValue, hyValue, onChange, hint, rows = 4 }: Props) {
  const refs = useRef<Record<"en" | "hy", HTMLTextAreaElement | null>>({ en: null, hy: null });

  const runAction = (lang: "en" | "hy", action: ToolbarAction) => {
    const el = refs.current[lang];
    if (!el) return;
    const value = lang === "en" ? enValue : hyValue;
    const { selectionStart, selectionEnd } = el;

    const result =
      action === "bold"
        ? applyInlineWrap(value, selectionStart, selectionEnd, "**")
        : action === "italic"
        ? applyInlineWrap(value, selectionStart, selectionEnd, "_")
        : action === "newline"
        ? applyNewLine(value, selectionStart, selectionEnd)
        : action === "paragraph"
        ? applyParagraphBreak(value, selectionStart, selectionEnd)
        : applyLinePrefix(value, selectionStart, selectionEnd, action);

    onChange(lang, result.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.selStart, result.selEnd);
    });
  };

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-2)", letterSpacing: "0.02em" }}>
          {label}
        </span>
        {hint && <span style={{ fontSize: "0.71rem", color: "var(--ink-4)" }}>{hint}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
        {(["en", "hy"] as const).map((lang) => {
          const value = lang === "en" ? enValue : hyValue;
          return (
            <div key={lang}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.28rem" }}>
                <span
                  style={{
                    fontSize: "0.59rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#fff",
                    background: lang === "en" ? "var(--ink)" : "var(--ink-3)",
                    padding: "0.12rem 0.38rem",
                    borderRadius: 3,
                  }}
                >
                  {lang}
                </span>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {TOOLBAR_ITEMS.map(({ action, icon, label, style }) => (
                    <span className="rtf-tool" key={action} data-tooltip={label}>
                      <button
                        type="button"
                        aria-label={label}
                        style={{ ...toolbarButtonStyle, ...style }}
                        onClick={() => runAction(lang, action)}
                      >
                        {icon}
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                ref={(el) => { refs.current[lang] = el; }}
                value={value}
                onChange={(e) => onChange(lang, e.target.value)}
                rows={rows}
                style={{ ...baseInput, minHeight: "88px" }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--ink)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              <div
                style={{
                  marginTop: "0.4rem",
                  padding: "0.5rem 0.65rem",
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.78rem",
                  color: "var(--ink-3)",
                  background: "var(--bg-2, transparent)",
                  minHeight: "1.6rem",
                }}
              >
                {value ? (
                  <div className="rtf-preview" dangerouslySetInnerHTML={{ __html: renderRichText(value) }} />
                ) : (
                  <span style={{ opacity: 0.6 }}>Preview</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .rtf-tool {
          position: relative;
          display: inline-flex;
        }
        .rtf-tool::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%) translateY(2px);
          background: var(--ink);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 500;
          white-space: nowrap;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.12s, transform 0.12s;
          z-index: 5;
        }
        .rtf-tool:hover::after {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .rtf-preview :global(ul),
        .rtf-preview :global(ol) {
          margin: 0.3rem 0;
          padding-left: 1.2rem;
        }
        .rtf-preview :global(p) {
          margin: 0 0 0.5rem 0;
        }
        .rtf-preview :global(p:last-child) {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
