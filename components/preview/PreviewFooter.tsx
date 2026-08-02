// yesofflineem_admin/components/preview/PreviewFooter.tsx
"use client";

import type { Lang } from "@/lib/event-i18n";
import { FOOTER_LABELS, LOGO_PARTS } from "@/lib/preview-labels";

export default function PreviewFooter({ lang }: { lang: Lang }) {
  const t = FOOTER_LABELS[lang];

  return (
    <>
      <style>{`
        .preview-footer-link:hover { color: #0a0a0a !important; }
        @media (max-width: 860px) {
          .preview-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; }
        }
        @media (max-width: 540px) {
          .preview-footer-root { padding: 3rem 1.5rem 1.5rem !important; }
          .preview-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <footer className="preview-footer-root" style={{ background: "#ffffff", color: "#888888", padding: "4rem 3rem 2rem", borderTop: "1px solid #e8e8e8" }}>
        <div className="preview-footer-grid" style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: "3rem", paddingBottom: "3rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <span style={{ display: "inline-flex", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontSize: "1.05rem", color: "#0a0a0a" }}>{LOGO_PARTS[0]}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.05rem", color: "#0a0a0a" }}>{LOGO_PARTS[1]}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 300, fontStyle: "italic", fontSize: "1.05rem", color: "#888888", paddingLeft: "1px" }}>{LOGO_PARTS[2]}</span>
            </span>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#4a4a4a", lineHeight: 1.6, maxWidth: 280, fontWeight: 300 }}>
              {t.tagline}
            </div>
          </div>

          <FooterColumn heading={t.explore} items={[t.home, t.events, t.about, t.contact, t.membership]} />

          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#0a0a0a", fontWeight: 600, marginBottom: "1.2rem" }}>
              {t.connect}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              <a href="mailto:info@yesofflineem.com" className="preview-footer-link" style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#4a4a4a", textDecoration: "none", fontWeight: 400 }}>
                info@yesofflineem.com
              </a>
              <a href="tel:+37441104090" className="preview-footer-link" style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#4a4a4a", textDecoration: "none", fontWeight: 400 }}>
                041 10 40 90
              </a>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#4a4a4a", fontWeight: 400 }}>
                {t.address}
              </div>
            </div>
          </div>

          <FooterColumn heading={t.legal} items={[t.privacy, t.terms]} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", paddingTop: "2rem", borderTop: "1px solid #e8e8e8" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#888888" }}>
            {t.copyright}
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterColumn({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#0a0a0a", fontWeight: 600, marginBottom: "1.2rem" }}>
        {heading}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {items.map((label) => (
          <span key={label} className="preview-footer-link" style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#4a4a4a", fontWeight: 400 }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
