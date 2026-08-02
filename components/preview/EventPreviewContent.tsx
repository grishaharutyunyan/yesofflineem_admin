"use client";

import type { EventView } from "@/lib/event-view";
import type { Lang } from "@/lib/event-i18n";
import { DETAIL_LABELS, FALLBACK_GALLERY } from "@/lib/preview-labels";
import { PREVIEW_BANNER_HEIGHT } from "./PreviewBanner";
import { PREVIEW_NAV_HEIGHT } from "./PreviewNav";

export default function EventPreviewContent({ view, lang }: { view: EventView; lang: Lang }) {
  const t = DETAIL_LABELS[lang];
  const paragraphs = view.longDesc.split("<PARA>").map((p) => p.trim()).filter(Boolean);
  const galleryImgs = view.galleryImages?.length ? view.galleryImages : FALLBACK_GALLERY;
  const filled = view.guests - view.spotsLeft;
  const pct = view.guests > 0 ? Math.round((filled / view.guests) * 100) : 0;
  const mapQuery = `${view.lat},${view.lng}`;

  return (
    <>
      <style>{`
        .preview-gallery-grid {
          display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr;
          gap:6px; height: 100%; min-height: 0; max-height: 560px;
          background: #fff;
        }
        .preview-gallery-cell { overflow:hidden; background: #f5f5f5; }
        .preview-gallery-cell img {
          width:100%; height:100%; object-fit:cover; display:block;
          filter: grayscale(1) contrast(0.95);
        }
        @media (max-width:900px) {
          .preview-detail-hero { grid-template-columns:1fr !important; }
          .preview-detail-body-grid { grid-template-columns:1fr !important; }
          .preview-detail-includes { grid-template-columns:1fr !important; }
          .preview-detail-gallery { min-height: auto !important; aspect-ratio: 3 / 2 !important; }
          .preview-detail-hero-sidebar { padding: 2rem 1.5rem !important; border-left: none !important; border-top: 1px solid #e8e8e8 !important; }
          .preview-detail-body { padding: 3rem 1.5rem !important; }
        }
      `}</style>

      <main style={{ paddingTop: PREVIEW_BANNER_HEIGHT + PREVIEW_NAV_HEIGHT, background: "#fff" }}>
        <div className="preview-detail-hero" style={{ display: "grid", gridTemplateColumns: "1fr 420px", alignItems: "stretch", minHeight: 560 }}>
          <div className="preview-detail-gallery">
            <div className="preview-gallery-grid">
              {galleryImgs.slice(0, 4).map((src, i) => (
                <div key={i} className="preview-gallery-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </div>

          <div className="preview-detail-hero-sidebar" style={{ background: "#fff", padding: "3rem 2.4rem", borderLeft: "1px solid #e8e8e8", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "#888888", letterSpacing: "0.04em" }}>
              ← {t.back}
            </span>

            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500, padding: "0.4rem 0.9rem", border: "1px solid #0a0a0a", width: "fit-content", color: "#0a0a0a" }}>
                {view.typeLabel}
              </div>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "2.1rem", fontWeight: 500, color: "#0a0a0a", letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: "0.6rem" }}>
                {view.title}
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />

            <div>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "2.5rem", fontWeight: 400, color: "#0a0a0a" }}>
                {view.price === 0 ? t.free : `AMD ${view.priceStr}`}
              </div>
              {view.price > 0 && (
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#888888", marginTop: "0.2rem" }}>
                  {t.priceNote}
                </div>
              )}
            </div>

            <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />

            {[
              { label: t.dateTime, val: view.dateLong },
              { label: t.location, val: view.locationFull },
              { label: t.groupSize, val: `${view.guests} ${t.guests}` },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888888", fontWeight: 500, marginBottom: "0.2rem" }}>{label}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "#0a0a0a" }}>{val}</div>
              </div>
            ))}

            <div style={{ background: "#f5f5f5", padding: "1rem 1.2rem" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888888", fontWeight: 500, marginBottom: "0.6rem" }}>{t.availability}</div>
              <div style={{ height: 6, background: "rgba(0,0,0,0.1)", borderRadius: 3, marginBottom: "0.5rem", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#0a0a0a", borderRadius: 3, width: `${pct}%` }} />
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#888888" }}>
                <strong style={{ color: "#0a0a0a" }}>{t.spotsLeft(view.spotsLeft)}</strong>
              </div>
            </div>

            {view.spotsLeft > 0 ? (
              <div
                title="Preview only — booking is disabled"
                style={{ background: "#2d2d2d", color: "#fff", border: "1px solid #2d2d2d", padding: "1.1rem 1.5rem", borderRadius: 2, fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 500, textAlign: "center", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "not-allowed", opacity: 0.7 }}
              >
                {view.ctaLabel || t.reserve}
              </div>
            ) : (
              <div style={{ background: "#f5f5f5", color: "#888888", padding: "1.1rem 1.5rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", textAlign: "center", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {t.soldOut}
              </div>
            )}
          </div>
        </div>

        <div className="preview-detail-body" style={{ padding: "4rem 3rem", maxWidth: 1200, margin: "0 auto" }}>
          <div className="preview-detail-body-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "4rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.85rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "1.2rem", letterSpacing: "-0.01em" }}>
                {t.about}
              </h2>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "#4a4a4a", lineHeight: 1.85, fontWeight: 300, marginBottom: "1rem" }}>{p}</p>
              ))}

              <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.85rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "1.2rem", letterSpacing: "-0.01em", marginTop: "2.5rem" }}>
                {t.included}
              </h2>
              <div className="preview-detail-includes" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", margin: "1.5rem 0" }}>
                {view.includes.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0a0a0a", flexShrink: 0, marginTop: "0.6rem" }} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#4a4a4a", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              {view.schedule.length > 0 && (
                <>
                  <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.85rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "1.2rem", letterSpacing: "-0.01em", marginTop: "2.5rem" }}>
                    {t.schedule}
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {view.schedule.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: "1.4rem", padding: "1rem 0", borderBottom: "1px solid #e8e8e8" }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#888888", fontWeight: 500, minWidth: 64, flexShrink: 0, paddingTop: "0.1rem" }}>{s.time}</div>
                        <div>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 500, color: "#0a0a0a" }}>{s.label}</div>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#888888", marginTop: "0.15rem" }}>{s.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.85rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "1.2rem", letterSpacing: "-0.01em", marginTop: "2.5rem" }}>
                {t.location}
              </h2>
              <div style={{ overflow: "hidden", border: "1px solid #e8e8e8" }}>
                <iframe width="100%" height="260" style={{ border: 0, display: "block", filter: "grayscale(1) contrast(0.88)" }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&z=14`}
                  title={`${t.mapTitle} ${view.locationFull}`} />
                <div style={{ padding: "0.9rem 1.2rem", background: "#fff", borderTop: "1px solid #e8e8e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#0a0a0a" }}>{view.mapAddress}</strong>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#0a0a0a", textDecoration: "underline", letterSpacing: "0.04em" }}>
                    {t.openMaps}
                  </a>
                </div>
              </div>
            </div>

            <div>
              {view.host && (
                <>
                  <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.85rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "1.2rem", letterSpacing: "-0.01em" }}>
                    {view.hostSectionTitle}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#fff", border: "1px solid #e8e8e8", padding: "1.4rem" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0, background: view.hostImageUrl ? `url(${view.hostImageUrl}) center/cover` : "#d4d4d4" }} />
                    <div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.96rem", fontWeight: 600, color: "#0a0a0a" }}>{view.host}</div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "#888888", marginTop: "0.2rem" }}>{view.hostRole}</div>
                    </div>
                  </div>
                </>
              )}

              {(view.goodToKnowTitle || view.goodToKnowText || view.goodToKnowTextTitle) && (
                <div style={{ marginTop: "2rem", background: "#f5f5f5", padding: "1.5rem" }}>
                  {view.goodToKnowTitle && (
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888888", fontWeight: 500, marginBottom: "0.8rem" }}>
                      {view.goodToKnowTitle}
                    </div>
                  )}
                  {view.goodToKnowTextTitle && (
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#4a4a4a", lineHeight: 1.7, fontWeight: 500, marginBottom: "0.8rem" }}>
                      {view.goodToKnowTextTitle}
                    </div>
                  )}
                  {view.goodToKnowText && (
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "#4a4a4a", lineHeight: 1.7, fontWeight: 300 }}>
                      {view.goodToKnowText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
