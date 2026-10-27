"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import Pagination from "@/components/Pagination";
import OrderCode from "@/components/OrderCode";
import EventSelect from "@/components/EventSelect";
import FilterSelect, { type FilterOption } from "@/components/FilterSelect";
import { getOrders, getEvents, downloadOrdersCsv, downloadOrdersPdf, currencyLabel, type ApiOrder, type ApiEvent } from "@/lib/api";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "Any status" },
  { value: "paid", label: "Paid", dot: "var(--success)" },
  { value: "pending", label: "Pending", dot: "var(--warning)" },
  { value: "failed", label: "Failed", dot: "var(--danger)" },
  { value: "refunded", label: "Refunded", dot: "var(--ink-4)" },
  { value: "reversed", label: "Reversed", dot: "var(--ink-4)" },
];

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  paid:     { bg: "var(--success-bg)", text: "var(--success)" },
  pending:  { bg: "var(--warning-bg)", text: "var(--warning)" },
  failed:   { bg: "var(--surface-2)",  text: "var(--ink-3)" },
  refunded: { bg: "var(--surface-2)",  text: "var(--ink-3)" },
  reversed: { bg: "var(--surface-2)",  text: "var(--ink-3)" },
};

function buildQuery(status: string, search: string, eventId: string, page?: number): string {
  const parts: string[] = [];
  if (eventId) parts.push(`eventId=${encodeURIComponent(eventId)}`);
  // Backend range is [page, limit].
  if (page) parts.push(`range=${encodeURIComponent(JSON.stringify([page, PAGE_SIZE]))}`);
  if (status) parts.push(`status=${encodeURIComponent(status)}`);
  if (search.trim()) parts.push(`search=${encodeURIComponent(search.trim())}`);
  return parts.join("&");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<ApiEvent[]>([]);

  // Events for the filter dropdown.
  useEffect(() => {
    getEvents(`range=${encodeURIComponent(JSON.stringify([1, 1000]))}`)
      .then((d) => setEvents(d.items))
      .catch(() => {});
  }, []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(buildQuery(status, search, eventId, page));
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
  }, [status, search, eventId, page]);

  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  // Both exports use the current filters (all pages, not just the visible one).
  async function handleExport(kind: "csv" | "pdf") {
    setExporting(kind);
    try {
      const query = buildQuery(status, search, eventId);
      await (kind === "pdf" ? downloadOrdersPdf(query) : downloadOrdersCsv(query));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
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
                color: "var(--ink)",
              }}>
                Orders
              </h1>
              <p style={{ color: "var(--ink-3)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
                {total} {total === 1 ? "order" : "orders"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={() => handleExport("csv")} className="btn-edit" disabled={exporting !== null} style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", fontWeight: 600 }}>
                {exporting === "csv" ? "Exporting…" : "Export CSV"}
              </button>
              <button onClick={() => handleExport("pdf")} className="primary-btn" disabled={exporting !== null}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 1.5v7.5M3.8 6.2L7 9.3l3.2-3.1M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {exporting === "pdf" ? "Preparing PDF…" : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, phone, email or order #"
              className="search-input"
            />
            <EventSelect events={events} value={eventId} onChange={(id) => { setEventId(id); setPage(1); }} />
            <FilterSelect label="Status" options={STATUS_OPTIONS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
            {(search || eventId || status) && (
              <button
                onClick={() => { setSearch(""); setEventId(""); setStatus(""); setPage(1); }}
                style={{ border: "none", background: "none", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}
              >
                Clear filters
              </button>
            )}
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
                      {["#", "Order", "Date", "Customer", "Phone", "Event", "Guests", "Amount", "Status"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => {
                      const c = STATUS_COLOR[o.status] ?? { bg: "var(--surface-2)", text: "var(--ink-3)" };
                      return (
                        <tr key={o.id}>
                          <td className="cell-idx">
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                              {(page - 1) * PAGE_SIZE + i + 1}
                            </span>
                          </td>
                          <td data-label="Order">
                            <OrderCode id={o.id} code={o.orderNumber} />
                          </td>
                          <td data-label="Date">
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)", whiteSpace: "nowrap" }}>
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="cell-main">
                            <Link href={`/orders/${o.id}`} style={{ color: "var(--ink)", fontWeight: 500 }}>
                              {[o.firstName, o.lastName].filter(Boolean).join(" ")}
                            </Link>
                            <div style={{ color: "var(--ink-4)", fontSize: "0.8rem" }}>{o.email}</div>
                          </td>
                          <td data-label="Phone" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>{o.phone ?? "—"}</td>
                          <td data-label="Event">{o.eventTitle?.en ?? o.eventSlug}</td>
                          <td data-label="Guests">{o.guests}</td>
                          <td data-label="Amount" style={{ whiteSpace: "nowrap" }}>{currencyLabel(o.currency)} {(o.amount / 100).toLocaleString()}</td>
                          <td data-label="Status">
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
                <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
              </div>
            )}
          </div>
        </main>
      </AuthGuard>
    </>
  );
}
