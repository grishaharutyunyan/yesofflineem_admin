"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import EventForm from "@/components/EventForm";
import EventParticipants from "@/components/EventParticipants";
import { getEvent, updateEvent, type ApiEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    getEvent(getToken()!, Number(id))
      .then(setEvent)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AuthGuard>
      <Nav />
      <main className="page-wrap">
        <div style={{ maxWidth: 860 }}>
          <Link href="/events" style={{ fontSize: "0.78rem", color: "var(--ink-4)", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.85rem", transition: "color 0.14s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-4)")}>
            ← Events
          </Link>

          {loading ? (
            <div style={{ color: "var(--ink-4)", fontSize: "0.875rem" }} className="pulsing">Loading…</div>
          ) : err ? (
            <div style={{ color: "var(--danger)", fontSize: "0.875rem", padding: "0.75rem 1rem", background: "var(--danger-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--danger-border)" }}>
              {err}
            </div>
          ) : event ? (
            <>
              <div style={{ marginBottom: "1.75rem" }}>
                <h1 style={{
                  fontFamily: "var(--font-cormorant, serif)",
                  fontSize: "1.85rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.01em",
                }}>
                  Edit event
                </h1>
                <p style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                  {event.slug}
                </p>
              </div>
              <EventForm
                initial={event}
                onSubmit={(dto) => updateEvent(getToken()!, event.id, dto).then(() => {})}
              />
              <EventParticipants eventId={event.id} />
            </>
          ) : null}
        </div>
      </main>
    </AuthGuard>
  );
}
