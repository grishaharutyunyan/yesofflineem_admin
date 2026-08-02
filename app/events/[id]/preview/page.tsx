// yesofflineem_admin/app/events/[id]/preview/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import PreviewBanner from "@/components/preview/PreviewBanner";
import PreviewNav from "@/components/preview/PreviewNav";
import PreviewFooter from "@/components/preview/PreviewFooter";
import EventPreviewContent from "@/components/preview/EventPreviewContent";
import { getEvent, type ApiEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toEventView } from "@/lib/event-view";
import type { Lang } from "@/lib/event-i18n";

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
          <EventPreviewContent view={toEventView(event, lang)} lang={lang} />
          <PreviewFooter lang={lang} />
        </>
      )}
    </AuthGuard>
  );
}
