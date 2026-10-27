"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import Pagination from "@/components/Pagination";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import {
  getMessages, getUnreadCounts, setMessageRead, markAllMessagesRead, deleteMessage, notifyUnreadChanged,
  type ContactMessage, type UnreadCounts,
} from "@/lib/api";

type Tab = "contact" | "membership";

const PAGE_SIZE = 20;

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>("contact");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [counts, setCounts] = useState<UnreadCounts>({ contact: 0, membership: 0, total: 0 });

  const refreshCounts = () => getUnreadCounts().then(setCounts).catch(() => {});
  useEffect(() => { refreshCounts(); }, []);

  async function toggleRead(msg: ContactMessage) {
    const read = !msg.readAt;
    // Optimistic: flip locally, then persist; reload on failure.
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, readAt: read ? new Date().toISOString() : null } : m)));
    try {
      await setMessageRead(msg.id, read);
    } catch {
      load(tab);
    }
    refreshCounts();
    notifyUnreadChanged();
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    const { id } = confirmTarget;
    setConfirmTarget(null);
    setDeleting(id);
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      // Step back if that was the last row on the page.
      if (pageRows.length === 1 && page > 1) setPage(page - 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setDeleting(null);
    }
    refreshCounts();
    notifyUnreadChanged();
  }

  async function markAllRead() {
    const now = new Date().toISOString();
    setMessages((prev) => prev.map((m) => (m.readAt ? m : { ...m, readAt: now })));
    try {
      await markAllMessagesRead(tab);
    } catch {
      load(tab);
    }
    refreshCounts();
    notifyUnreadChanged();
  }

  async function load(source: Tab) {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages(source);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(tab); }, [tab]);

  // The endpoint returns every message at once, so pages are sliced client-side.
  const visible = unreadOnly ? messages.filter((m) => !m.readAt) : messages;
  const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const tabUnread = counts[tab];

  return (
    <>
      <style>{`
        .tab-bar { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 1.75rem; }
        .tab-btn {
          background: none; border: none; border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          padding: 0.65rem 1.4rem;
          font-size: 0.845rem; font-weight: 500;
          color: var(--ink-4);
          cursor: pointer; transition: color var(--transition);
          letter-spacing: 0.01em;
        }
        .tab-btn:hover { color: var(--ink-2); }
        .tab-btn.active { border-bottom-color: var(--accent); color: var(--accent-ink); font-weight: 600; }

        .tab-count {
          margin-left: 0.45rem; min-width: 20px; height: 20px; padding: 0 6px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 100px; background: var(--danger); color: #fff;
          font-size: 0.68rem; font-weight: 700; vertical-align: 1px;
        }
        .msg-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .btn-ghost {
          padding: 0.45rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-2);
          background: var(--surface); color: var(--ink-2); font-size: 0.8rem; font-weight: 600; cursor: pointer;
          transition: all var(--transition);
        }
        .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
        .tbl tr.unread td { background: #f8f9ff; }
        .tbl tr.unread td:first-child { box-shadow: inset 3px 0 0 var(--accent); }
        .tbl tr.unread .msg-name { font-weight: 700; }
        .unread-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); margin-right: 0.45rem; vertical-align: 1px; }
        .read-btn {
          padding: 0.28rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;
          cursor: pointer; white-space: nowrap; border: 1px solid var(--border); background: var(--surface); color: var(--ink-3);
          transition: all var(--transition);
        }
        .read-btn:hover { border-color: var(--border-2); color: var(--ink); }
        .read-btn.primary { border-color: #c7d2fe; background: var(--accent-bg); color: var(--accent-ink); }
        .read-btn.primary:hover { background: #e0e7ff; }
        .msg-contact-line { display: block; font-size: 0.8rem; color: var(--ink-3); margin-top: 0.15rem; }
        a.msg-contact-line:hover { color: var(--accent); }
        @media (max-width: 768px) {
          .tbl tr.unread { background: #f8f9ff; box-shadow: inset 3px 0 0 var(--accent); }
          .tbl td.msg-body { display: block; text-align: left; min-width: 0 !important; padding: 0.35rem 0; }
          .tbl td.msg-body::before { display: block; margin-bottom: 0.2rem; }
          .msg-toolbar { align-items: stretch; }
        }
        .msg-body { min-width: 280px; color: var(--ink-2); line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
      `}</style>

      <AuthGuard>
        <Nav />
        <main className="page-wrap">

          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem", fontWeight: 650,
              lineHeight: 1, letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}>
              Messages
            </h1>
            <p style={{ color: "var(--ink-3)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
              {loading ? "Loading…" : `${messages.length} ${messages.length === 1 ? "message" : "messages"} · ${tabUnread} unread`}
            </p>
          </div>

          <div className="tab-bar">
            {(["contact", "membership"] as Tab[]).map((t) => (
              <button
                key={t}
                className={`tab-btn${tab === t ? " active" : ""}`}
                onClick={() => { setTab(t); setPage(1); }}
              >
                {t === "contact" ? "Contact" : "Membership"}
                {counts[t] > 0 && <span className="tab-count">{counts[t] > 99 ? "99+" : counts[t]}</span>}
              </button>
            ))}
          </div>

          <div className="msg-toolbar">
            <div className="seg" role="group" aria-label="Filter messages">
              <button className={!unreadOnly ? "on" : ""} aria-pressed={!unreadOnly} onClick={() => { setUnreadOnly(false); setPage(1); }}>All</button>
              <button className={unreadOnly ? "on" : ""} aria-pressed={unreadOnly} onClick={() => { setUnreadOnly(true); setPage(1); }}>
                Unread{tabUnread > 0 ? ` (${tabUnread})` : ""}
              </button>
            </div>
            {tabUnread > 0 && (
              <button className="btn-ghost" onClick={markAllRead}>✓ Mark all as read</button>
            )}
          </div>

          {loading ? (
            <div className="pulsing" style={{ padding: "4rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }}>
              Loading messages…
            </div>
          ) : error ? (
            <div style={{
              padding: "0.9rem 1.1rem",
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--danger)",
              fontSize: "0.82rem",
            }}>
              {error}
            </div>
          ) : visible.length === 0 ? (
            <div style={{
              padding: "4rem",
              textAlign: "center",
              color: "var(--ink-4)",
              fontSize: "0.875rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow)",
            }}>
              {unreadOnly ? `No unread ${tab} messages — you're all caught up.` : `No ${tab} messages yet.`}
            </div>
          ) : (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              boxShadow: "var(--shadow)",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {["#", "Contact", "Message", "Date", "Actions"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((msg, i) => (
                      <tr key={msg.id} className={msg.readAt ? "" : "unread"}>
                        <td className="cell-idx">
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                            {(page - 1) * PAGE_SIZE + i + 1}
                          </span>
                        </td>
                        <td className="cell-main" style={{ whiteSpace: "nowrap" }}>
                          <div className="msg-name" style={{ fontWeight: 500, color: "var(--ink)" }}>
                            {!msg.readAt && <span className="unread-dot" aria-label="Unread" />}
                            {msg.name}
                          </div>
                          <a href={`mailto:${msg.email}`} className="msg-contact-line">{msg.email}</a>
                          {msg.phone && <div className="msg-contact-line">{msg.phone}</div>}
                        </td>
                        <td data-label="Message" className="msg-body">{msg.message}</td>
                        <td data-label="Date">
                          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                            {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td data-label="" className="cell-actions">
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button className={`read-btn${msg.readAt ? "" : " primary"}`} onClick={() => toggleRead(msg)}>
                              {msg.readAt ? "Mark unread" : "Mark as read"}
                            </button>
                            <button className="btn-del" disabled={deleting === msg.id} onClick={() => setConfirmTarget(msg)}>
                              {deleting === msg.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={visible.length} onChange={setPage} />
            </div>
          )}

        </main>

        {confirmTarget && (
          <ConfirmDeleteModal
            kind="message"
            name={`Message from ${confirmTarget.name}`}
            onCancel={() => setConfirmTarget(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AuthGuard>
    </>
  );
}
