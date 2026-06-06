"use client";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import EventForm from "@/components/EventForm";
import { createEvent } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";

export default function NewEventPage() {
  return (
    <AuthGuard>
      <Nav />
      <main className="page-wrap">
        <div style={{ maxWidth: 860 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <Link href="/events" style={{ fontSize: "0.78rem", color: "var(--ink-4)", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.85rem", transition: "color 0.14s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-4)")}>
              ← Events
            </Link>
            <h1 style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "1.85rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.01em",
            }}>
              New event
            </h1>
            <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
              Fill in the fields below to create a new event listing.
            </p>
          </div>
          <EventForm
            onSubmit={(dto) => createEvent(getToken()!, dto).then(() => {})}
          />
        </div>
      </main>
    </AuthGuard>
  );
}
