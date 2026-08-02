"use client";

import type { EventView } from "@/lib/event-view";
import type { Lang } from "@/lib/event-i18n";
import { DETAIL_LABELS, CARD_FALLBACK_IMAGE } from "@/lib/preview-labels";

export default function EventCardPreview({ view, lang }: { view: EventView; lang: Lang }) {
  const t = DETAIL_LABELS[lang];
  const imgSrc = view.cardImage ?? CARD_FALLBACK_IMAGE;

  return (
    <>
      <style>{`
        .preview-event-card {
          height: 560px; min-height: 560px; max-height: 560px;
          display: grid; grid-template-columns: 1.2fr 1fr;
          border: 1px solid #e8e8e8; overflow: hidden; background: #fff;
        }
        @media (max-width: 900px) {
          .preview-event-card { grid-template-columns: 1fr !important; min-height: auto !important; height: auto !important; max-height: none !important; }
          .preview-event-right { border-left: none !important; border-top: 1px solid rgba(0,0,0,0.05); }
          .preview-event-image-wrap { min-height: auto !important; aspect-ratio: 3 / 2 !important; }
        }
      `}</style>

      <div className="preview-event-card" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="preview-event-image-wrap" style={{ position: "relative", overflow: "hidden", display: "flex", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt={view.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0.25) 0%,transparent 50%)" }} />
          <div style={{ position: "absolute", top: "1.2rem", left: "1.2rem", background: "#fff", padding: "0.7rem 1rem", textAlign: "center", minWidth: 62 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#0a0a0a", fontWeight: 600, marginBottom: "0.2rem" }}>
              {view.monthShort}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.7rem", fontWeight: 400, lineHeight: 1, color: "#0a0a0a" }}>
              {view.day}
            </div>
          </div>
        </div>

        <div className="preview-event-right" style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid #e8e8e8" }}>
          <div style={{ padding: "2rem 2.5rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888888", fontWeight: 500, marginBottom: "1rem" }}>
              {view.typeLabel}
            </div>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 500, color: "#0a0a0a", letterSpacing: "-0.015em", lineHeight: 1.18, marginBottom: "1rem" }}>
              {view.title}
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "#888888", lineHeight: 1.65, fontWeight: 300, marginBottom: "1.8rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
              {view.desc}
            </p>
            <div style={{ display: "flex", gap: "1.4rem", alignItems: "center", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#aaaaaa", flexWrap: "wrap" }}>
              {[view.location, view.duration].map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: "2rem 2.5rem", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "2.6rem", fontWeight: 400, color: "#0a0a0a" }}>
                {view.price === 0 ? t.free : view.priceStr}
              </div>
              {view.price > 0 && (
                <small style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginTop: "0.2rem" }}>
                  {t.priceUnit}
                </small>
              )}
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#0a0a0a", fontWeight: 500, letterSpacing: "0.06em" }}>
              {view.spotsLeft === 0 ? t.soldOut : t.spotsLeft(view.spotsLeft)}
            </div>
            <div
              title="Preview only — booking is disabled"
              style={{ display: "block", background: "#2d2d2d", color: "#fff", border: "1px solid #2d2d2d", padding: "1rem 2rem", borderRadius: 2, fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", cursor: "not-allowed", opacity: 0.7 }}
            >
              {t.viewReserve}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
