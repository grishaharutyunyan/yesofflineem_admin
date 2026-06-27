"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import { getMessages, type ContactMessage } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Tab = "contact" | "membership";

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>("contact");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(source: Tab) {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages(getToken()!, source);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(tab); }, [tab]);

  return (
    <>
      <style>{`
        .tab-bar { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 1.75rem; }
        .tab-btn {
          background: none; border: none; border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          padding: 0.65rem 1.4rem;
          font-size: 0.845rem; font-weight: 500;
          color: var(--ink-4);
          cursor: pointer; transition: color var(--transition);
          letter-spacing: 0.01em;
        }
        .tab-btn:hover { color: var(--ink-2); }
        .tab-btn.active { border-bottom-color: var(--ink); color: var(--ink); font-weight: 600; }

        .msg-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow); }
        .msg-card {
          background: var(--surface);
          display: grid;
          grid-template-columns: 210px 1fr;
          gap: 1.5rem;
          padding: 1.4rem 1.6rem;
          transition: background var(--transition);
        }
        .msg-card:hover { background: var(--surface-2); }
        .msg-sender-name { font-size: 0.9rem; font-weight: 600; color: var(--ink); margin-bottom: 0.2rem; }
        .msg-sender-email { font-size: 0.8rem; color: var(--ink-3); display: block; margin-bottom: 0.15rem; }
        .msg-sender-phone { font-size: 0.8rem; color: var(--ink-4); }
        .msg-date { font-size: 0.72rem; color: var(--ink-4); margin-top: 0.55rem; }
        .msg-body { font-size: 0.875rem; color: var(--ink-2); line-height: 1.75; white-space: pre-wrap; word-break: break-word; }

        @media (max-width: 640px) {
          .msg-card { grid-template-columns: 1fr; gap: 0.75rem; }
        }
      `}</style>

      <AuthGuard>
        <Nav />
        <main className="page-wrap">

          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "1.85rem", fontWeight: 600,
              lineHeight: 1, letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}>
              Messages
            </h1>
            <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
              {loading ? "Loading…" : `${messages.length} ${messages.length === 1 ? "message" : "messages"}`}
            </p>
          </div>

          <div className="tab-bar">
            {(["contact", "membership"] as Tab[]).map((t) => (
              <button
                key={t}
                className={`tab-btn${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "contact" ? "Contact" : "Membership"}
              </button>
            ))}
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
          ) : messages.length === 0 ? (
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
              No {tab} messages yet.
            </div>
          ) : (
            <div className="msg-list">
              {messages.map((msg) => (
                <div key={msg.id} className="msg-card">
                  <div>
                    <div className="msg-sender-name">{msg.name}</div>
                    <a href={`mailto:${msg.email}`} className="msg-sender-email">{msg.email}</a>
                    {msg.phone && <div className="msg-sender-phone">{msg.phone}</div>}
                    <div className="msg-date">
                      {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="msg-body">{msg.message}</div>
                </div>
              ))}
            </div>
          )}

        </main>
      </AuthGuard>
    </>
  );
}
