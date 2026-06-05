"use client";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import VideoForm from "@/components/VideoForm";
import { createVideo } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";

export default function NewVideoPage() {
  return (
    <AuthGuard>
      <Nav />
      <main style={{ marginLeft: "var(--sidebar-w)", padding: "2.25rem 2.5rem", minHeight: "100vh" }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <Link href="/videos" style={{ fontSize: "0.78rem", color: "var(--ink-4)", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.85rem", transition: "color 0.14s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-4)")}>
              ← Videos
            </Link>
            <h1 style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "1.85rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.01em",
            }}>
              New video
            </h1>
            <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
              Add a video to the public gallery.
            </p>
          </div>
          <VideoForm
            onSubmit={(dto) => createVideo(getToken()!, dto).then(() => {})}
          />
        </div>
      </main>
    </AuthGuard>
  );
}
