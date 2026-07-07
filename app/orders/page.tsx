"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import { getOrders, exportOrders, type ApiOrder } from "@/lib/api";
import { getToken } from "@/lib/auth";

const STATUS_FILTERS = ["all", "pending", "paid", "failed", "refunded", "reversed"];

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  paid:     { bg: "var(--success-bg)", text: "var(--success)" },
  pending:  { bg: "var(--warning-bg)", text: "var(--warning)" },
  failed:   { bg: "var(--surface-2)",  text: "var(--ink-3)" },
  refunded: { bg: "var(--surface-2)",  text: "var(--ink-3)" },
  reversed: { bg: "var(--surface-2)",  text: "var(--ink-3)" },
};

function buildQuery(status: string, search: string): string {
  const parts: string[] = [];
  if (status !== "all") parts.push(`status=${encodeURIComponent(status)}`);
  if (search.trim()) parts.push(`search=${encodeURIComponent(search.trim())}`);
  return parts.join("&");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(getToken()!, buildQuery(status, search));
      setOrders(data.items);
      setTotal(data.count);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  async function handleExport() {
    try {
      const blob = await exportOrders(getToken()!, buildQuery(status, search));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  return (
    <>
      <style>{`
        .filter-pill {
          padding: 0.28rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: 100px;
          background: var(--surface);
          color: var(--ink-3);
          font-size: 0.775rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
          text-transform: capitalize;
          letter-spacing: 0.02em;
        }
        .filter-pill:hover { border-color: var(--ink); color: var(--ink); }
        .filter-pill.on { background: var(--ink); color: #fff; border-color: var(--ink); }
        .search-input {
          padding: 0.5rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--ink);
          font-size: 0.82rem;
          min-width: 240px;
          transition: border-color var(--transition);
        }
        .search-input:hover { border-color: var(--ink-3); }
        .search-input::placeholder { color: var(--ink-4); }
        .tbl { width: 100%; border-collapse: collapse; }
        .tbl th {
          padding: 0.6rem 1rem;
          text-align: left;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--ink-4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          background: var(--surface-2);
        }
        .tbl td {
          padding: 0.78rem 1rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.855rem;
          color: var(--ink);
          vertical-align: middle;
        }
        .tbl tbody tr:last-child td { border-bottom: none; }
        .tbl tbody tr { transition: background var(--transition); }
        .tbl tbody tr:hover td { background: #faf8f4; }
        .primary-btn {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.52rem 1.1rem;
          background: var(--ink); color: #fff;
          border: 1px solid var(--ink);
          border-radius: var(--radius-sm);
          font-size: 0.845rem; font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
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
                color: "var(--ink)",
              }}>
                Orders
              </h1>
              <p style={{ color: "var(--ink-4)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
                {total} {total === 1 ? "order" : "orders"}
              </p>
            </div>
            <button onClick={handleExport} className="primary-btn">Export CSV</button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or order #"
              className="search-input"
            />
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {STATUS_FILTERS.map((s) => (
                <button key={s} className={`filter-pill${status === s ? " on" : ""}`} onClick={() => setStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: "1rem",
              padding: "0.7rem 1rem",
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--danger)",
              fontSize: "0.82rem",
            }}>
              {error}
            </div>
          )}

          {/* Table card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
          }}>
            {loading ? (
              <div className="pulsing" style={{ padding: "4rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }}>
                Loading orders…
              </div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }}>
                No orders found.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      {["Date", "Customer", "Event", "Guests", "Amount", "Status"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const c = STATUS_COLOR[o.status] ?? { bg: "var(--surface-2)", text: "var(--ink-3)" };
                      return (
                        <tr key={o.id}>
                          <td>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <Link href={`/orders/${o.id}`} style={{ color: "var(--ink)", fontWeight: 500 }}>
                              {o.firstName} {o.lastName ?? ""}
                            </Link>
                            <div style={{ color: "var(--ink-4)", fontSize: "0.8rem" }}>{o.email}</div>
                          </td>
                          <td>{o.eventTitle?.en ?? o.eventSlug}</td>
                          <td>{o.guests}</td>
                          <td style={{ whiteSpace: "nowrap" }}>{o.currency} {(o.amount / 100).toLocaleString()}</td>
                          <td>
                            <span style={{
                              display: "inline-flex", alignItems: "center",
                              background: c.bg, color: c.text,
                              padding: "0.18rem 0.55rem", borderRadius: 100,
                              fontSize: "0.71rem", fontWeight: 600,
                              letterSpacing: "0.04em", textTransform: "capitalize",
                            }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
