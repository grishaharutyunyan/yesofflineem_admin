// yesofflineem_admin/app/events/[id]/preview/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import PreviewBanner, { PREVIEW_BANNER_HEIGHT } from "@/components/preview/PreviewBanner";
import PreviewNav, { PREVIEW_NAV_HEIGHT } from "@/components/preview/PreviewNav";
import PreviewFooter from "@/components/preview/PreviewFooter";
import EventPreviewContent from "@/components/preview/EventPreviewContent";
import EventCardPreview from "@/components/preview/EventCardPreview";
import { getEvent, type ApiEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toEventView } from "@/lib/event-view";
import type { Lang } from "@/lib/event-i18n";

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 0" }}>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600 }}>
        {children}
      </div>
    </div>
  );
}

export default function EventPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    getEvent(getToken()!, Number(id))
      .then(setEvent)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AuthGuard>
      {loading ? (
        <div style={{ padding: "6rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }}>
          Loading preview…
        </div>
      ) : err || !event ? (
        <div style={{ padding: "6rem", textAlign: "center" }}>
          <div style={{ color: "var(--danger)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            {err || "Event not found"}
          </div>
          <a href={`/events/${id}`} style={{ fontSize: "0.8rem", color: "var(--ink-4)", textDecoration: "underline" }}>
            ← Back to edit
          </a>
        </div>
      ) : (
        <>
          <PreviewBanner status={event.status} lang={lang} onLangChange={setLang} backHref={`/events/${id}`} />
          <PreviewNav lang={lang} onLangChange={setLang} />

          <div style={{ padding: `${PREVIEW_BANNER_HEIGHT + PREVIEW_NAV_HEIGHT}px 3rem 2rem`, background: "#fafafa" }}>
            <SectionLabel>As it appears in the Events list</SectionLabel>
            <EventCardPreview view={toEventView(event, lang)} lang={lang} />
          </div>

          <div style={{ padding: "0 3rem", background: "#fafafa", borderTop: "1px solid #e8e8e8" }}>
            <SectionLabel>As it appears on its own page</SectionLabel>
          </div>

          <EventPreviewContent view={toEventView(event, lang)} lang={lang} />
          <PreviewFooter lang={lang} />
        </>
      )}
    </AuthGuard>
  );
}
