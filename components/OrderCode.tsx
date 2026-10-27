"use client";
import { useState } from "react";
import Link from "next/link";

// Order numbers are 32-char hex: show a short prefix linking to the order, with a copy button for the full code.
export default function OrderCode({ id, code }: { id: number; code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }).catch(() => {});
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", whiteSpace: "nowrap" }}>
      <Link
        href={`/orders/${id}`}
        title={code}
        style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)" }}
      >
        {code.length > 10 ? `${code.slice(0, 8)}…` : code}
      </Link>
      <button
        onClick={copy}
        title={copied ? "Copied" : "Copy full code"}
        aria-label={copied ? "Copied" : "Copy full order code"}
        style={{
          display: "inline-flex", alignItems: "center", padding: "0.2rem",
          border: "none", background: "none", borderRadius: 4, cursor: "pointer",
          color: copied ? "var(--success)" : "var(--ink-4)",
        }}
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M9.5 4.5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v5.5a1 1 0 001 1h1.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        )}
      </button>
    </span>
  );
}
