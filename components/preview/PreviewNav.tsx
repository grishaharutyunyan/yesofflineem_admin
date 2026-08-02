// yesofflineem_admin/components/preview/PreviewNav.tsx
"use client";

import { useState } from "react";
import { PREVIEW_BANNER_HEIGHT } from "./PreviewBanner";
import { NAV_LINK_LABELS, LOGO_PARTS } from "@/lib/preview-labels";
import type { Lang } from "@/lib/event-i18n";

export default function PreviewNav({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isEn = lang === "en";
  const links = NAV_LINK_LABELS[lang];

  return (
    <>
      <style>{`
        .preview-nav-cta:hover { background: #ffffff !important; color: #2d2d2d !important; }
        @media (max-width: 900px) {
          .preview-nav-desktop { display: none !important; }
          .preview-nav-hamburger { display: flex !important; }
        }
        @media (min-width: 901px) {
          .preview-nav-hamburger { display: none !important; }
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: PREVIEW_BANNER_HEIGHT,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.4rem 3rem",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 300, color: "#0a0a0a" }}>{LOGO_PARTS[0]}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 700, color: "#0a0a0a" }}>{LOGO_PARTS[1]}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 300, fontStyle: "italic", color: "#888888", paddingLeft: "1px" }}>{LOGO_PARTS[2]}</span>
        </span>

        <div className="preview-nav-desktop" style={{ display: "flex", gap: "2.3rem", alignItems: "center" }}>
          {links.items.map((label) => (
            <span
              key={label}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.84rem",
                fontWeight: 400,
                color: "#4a4a4a",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          ))}

          <span
            className="preview-nav-cta"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "#2d2d2d",
              color: "#ffffff",
              border: "1px solid #2d2d2d",
              borderRadius: "2px",
              padding: "0.6rem 1.4rem",
              display: "inline-block",
            }}
          >
            {links.cta}
          </span>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 0, marginLeft: "0.5rem" }}>
            <button type="button" onClick={() => onLangChange("en")} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: isEn ? "#0a0a0a" : "#888888", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.55rem" }}>EN</button>
            <span style={{ display: "inline-block", width: "1px", height: "10px", background: "#d4d4d4" }} />
            <button type="button" onClick={() => onLangChange("hy")} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: !isEn ? "#0a0a0a" : "#888888", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.55rem" }}>ՀԱՅ</button>
          </div>
        </div>

        <div className="preview-nav-hamburger" style={{ alignItems: "center", gap: "1rem" }}>
          <button type="button" onClick={() => onLangChange(isEn ? "hy" : "en")} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.14em", color: "#4a4a4a", background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}>
            {isEn ? "ՀԱՅ" : "EN"}
          </button>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ display: "block", width: "22px", height: "1px", background: "#0a0a0a", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", width: "22px", height: "1px", background: "#0a0a0a", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: "22px", height: "1px", background: "#0a0a0a", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position: "fixed", top: PREVIEW_BANNER_HEIGHT + 78, left: 0, right: 0, zIndex: 99, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {links.items.map((label) => (
            <span key={label} style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "#4a4a4a" }}>
              {label}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
