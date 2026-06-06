"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import { getVideos, deleteVideo, type ApiVideo } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function VideosPage() {
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const data = await getVideos(getToken()!);
    setVideos(data.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    try {
      await deleteVideo(getToken()!, id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <style>{`
        .tbl { width: 100%; border-collapse: collapse; }
        .tbl th {
          padding: 0.6rem 1rem;
          text-align: left;
          font-size: 0.68rem; font-weight: 600;
          color: var(--ink-4);
          letter-spacing: 0.08em; text-transform: uppercase;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          background: var(--surface-2);
        }
        .tbl td {
          padding: 0.78rem 1rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.855rem; color: var(--ink);
          vertical-align: middle;
        }
        .tbl tbody tr:last-child td { border-bottom: none; }
        .tbl tbody tr { transition: background var(--transition); }
        .tbl tbody tr:hover td { background: #faf8f4; }
        .btn-edit {
          display: inline-block;
          padding: 0.28rem 0.65rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.765rem; font-weight: 500;
          color: var(--ink-2); background: var(--surface);
          cursor: pointer; transition: all var(--transition);
          text-decoration: none;
        }
        .btn-edit:hover { border-color: var(--ink-2); color: var(--ink); }
        .btn-del {
          padding: 0.28rem 0.65rem;
          border: 1px solid var(--danger-border);
          border-radius: var(--radius-sm);
          font-size: 0.765rem; font-weight: 500;
          color: var(--danger); background: var(--surface);
          cursor: pointer; transition: all var(--transition);
        }
        .btn-del:hover:not(:disabled) { background: var(--danger-bg); }
        .btn-del:disabled { opacity: 0.45; cursor: default; }
        .primary-btn {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.52rem 1.1rem;
          background: var(--ink); color: #fff;
          border-radius: var(--radius-sm);
          font-size: 0.845rem; font-weight: 600;
          letter-spacing: 0.01em;
          transition: opacity var(--transition);
          text-decoration: none;
        }
        .primary-btn:hover { opacity: 0.82; }
        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start !important; }
        }
      `}</style>
      <AuthGuard>
        <Nav />
        <main className="page-wrap">

          {/* Header */}
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-cormorant, serif)",
                fontSize: "1.85rem", fontWeight: 600,
                lineHeight: 1, letterSpacing: "-0.01em",
              }}>
                Videos
              </h1>
              <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
                {videos.length} {videos.length === 1 ? "video" : "videos"}
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
                      {["ID", "Title", "Priority", ""].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                            {v.id}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {v.title.en}
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", color: "var(--ink-2)" }}>
                            {v.priority}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <Link href={`/videos/${v.id}`} className="btn-edit">Edit</Link>
                            <button
                              onClick={() => handleDelete(v.id, v.title.en)}
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
              </div>
            )}
          </div>
        </main>
      </AuthGuard>
    </>
  );
}
