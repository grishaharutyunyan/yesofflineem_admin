"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import VideoForm from "@/components/VideoForm";
import { getVideo, updateVideo, type ApiVideo } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<ApiVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    getVideo(getToken()!, Number(id))
      .then(setVideo)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AuthGuard>
      <Nav />
      <main style={{ marginLeft: "var(--sidebar-w)", padding: "2.25rem 2.5rem", minHeight: "100vh" }}>
        <div style={{ maxWidth: 760 }}>
          <Link href="/videos" style={{ fontSize: "0.78rem", color: "var(--ink-4)", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.85rem", transition: "color 0.14s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-4)")}>
            ← Videos
          </Link>

          {loading ? (
            <div style={{ color: "var(--ink-4)", fontSize: "0.875rem" }} className="pulsing">Loading…</div>
          ) : err ? (
            <div style={{ color: "var(--danger)", fontSize: "0.875rem", padding: "0.75rem 1rem", background: "var(--danger-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--danger-border)" }}>
              {err}
            </div>
          ) : video ? (
            <>
              <div style={{ marginBottom: "1.75rem" }}>
                <h1 style={{
                  fontFamily: "var(--font-cormorant, serif)",
                  fontSize: "1.85rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.01em",
                }}>
                  Edit video
                </h1>
                <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
                  #{video.id} — {video.title.en}
                </p>
              </div>
              <VideoForm
                initial={video}
                onSubmit={(dto) => updateVideo(getToken()!, video.id, dto).then(() => {})}
              />
            </>
          ) : null}
        </div>
      </main>
    </AuthGuard>
  );
}
