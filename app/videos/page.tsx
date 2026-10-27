"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import Pagination from "@/components/Pagination";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { getVideos, deleteVideo, type ApiVideo } from "@/lib/api";

const PAGE_SIZE = 20;

export default function VideosPage() {
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; title: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      // Backend range is [page, limit].
      const data = await getVideos(`range=${encodeURIComponent(JSON.stringify([page, PAGE_SIZE]))}`);
      setVideos(data.items);
      setTotal(data.count);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  async function confirmDelete() {
    if (!confirmTarget) return;
    const { id } = confirmTarget;
    setConfirmTarget(null);
    setDeleting(id);
    try {
      await deleteVideo(id);
      // Refetch so the next video moves up into this page; step back if the page emptied.
      if (videos.length === 1 && page > 1) setPage(page - 1);
      else load();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <style>{`
      `}</style>
      <AuthGuard>
        <Nav />
        <main className="page-wrap">

          {/* Header */}
          <div className="page-header" style={{ marginBottom: "1.75rem" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem", fontWeight: 650,
                lineHeight: 1, letterSpacing: "-0.01em",
              }}>
                Videos
              </h1>
              <p style={{ color: "var(--ink-3)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
                {total} {total === 1 ? "video" : "videos"}
              </p>
            </div>
            <Link href="/videos/new" className="primary-btn">
              <span style={{ fontSize: "1.1rem", lineHeight: 1, marginTop: "-1px" }}>+</span>
              New video
            </Link>
          </div>

          {/* Table card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
          }}>
            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }} className="pulsing">
                Loading videos…
              </div>
            ) : videos.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <div style={{ color: "var(--ink-3)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>No videos yet</div>
                <Link href="/videos/new" style={{ fontSize: "0.8rem", color: "var(--ink-4)", textDecoration: "underline" }}>
                  Upload your first video →
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {["#", "Title", "Subtitle", "Priority", "Added", "Actions"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v, i) => (
                      <tr key={v.id}>
                        <td className="cell-idx">
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                            {(page - 1) * PAGE_SIZE + i + 1}
                          </span>
                        </td>
                        <td className="cell-main" style={{ fontWeight: 500, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Link href={`/videos/${v.id}`} style={{ color: "var(--ink)" }}>{v.title.en}</Link>
                        </td>
                        <td data-label="Subtitle" style={{ color: "var(--ink-3)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {v.subtitle?.en || "—"}
                        </td>
                        <td data-label="Priority">
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", color: "var(--ink-2)" }}>
                            {v.priority}
                          </span>
                        </td>
                        <td data-label="Added">
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                            {v.createdAt.slice(0, 10)}
                          </span>
                        </td>
                        <td data-label="" className="cell-actions">
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <Link href={`/videos/${v.id}`} className="btn-edit">Edit</Link>
                            <button
                              onClick={() => setConfirmTarget({ id: v.id, title: v.title.en })}
                              disabled={deleting === v.id}
                              className="btn-del"
                            >
                              {deleting === v.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
              </div>
            )}
          </div>
        </main>

        {confirmTarget && (
          <ConfirmDeleteModal
            kind="video"
            name={confirmTarget.title}
            onCancel={() => setConfirmTarget(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AuthGuard>
    </>
  );
}
