"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import OrderCode from "@/components/OrderCode";
import { getOrders, downloadParticipantsPdf, type ApiOrder } from "@/lib/api";

const PAGE_SIZE = 20;

function fullName(firstName: string, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export default function EventParticipants({ eventId, eventTitle }: { eventId: number; eventTitle: string }) {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");

  async function downloadPdf() {
    setPdfState("loading");
    try {
      await downloadParticipantsPdf(eventId);
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getOrders(`eventId=${eventId}&status=paid&range=${encodeURIComponent(JSON.stringify([1, 10000]))}`)
      .then((data) => { if (alive) setOrders(data.items); })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : "Failed to load participants"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [eventId]);

  // One row per booking (the person who booked); guests from guestDetails open underneath.
  const peopleCount = orders.reduce((n, o) => n + 1 + (o.guestDetails?.length ?? 0), 0);
  const pageRows = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <>

      <style>{`
        .guest-btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.22rem 0.6rem; border-radius: var(--radius-sm);
          border: 1px solid #c7d2fe; background: var(--accent-bg); color: var(--accent-ink);
          font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: background var(--transition);
        }
        .guest-btn:hover { background: #e0e7ff; }
        .guest-btn .chev { transition: transform 0.15s; }
        .guest-btn[aria-expanded="true"] .chev { transform: rotate(180deg); }
        @media (max-width: 768px) {
          .tbl tr.guest-row { background: var(--surface-2); padding: 0.55rem 1rem 0.55rem 1.75rem; }
          .tbl tr.guest-row td { justify-content: flex-start; text-align: left; padding-left: 0 !important; }
        }
        .tbl tr.guest-row td { background: var(--surface-2); font-size: 0.83rem; padding-top: 0.55rem; padding-bottom: 0.55rem; }
      `}</style>
      <section style={{ marginTop: "1.75rem" }}>
        <div className="page-header" style={{ marginBottom: "1rem", alignItems: "flex-end" }}>
          <div>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.4rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.01em",
          }}>
            Participants — {eventTitle}
          </h2>
          <p style={{ color: "var(--ink-4)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
            {loading
              ? "Loading…"
              : `${orders.length} ${orders.length === 1 ? "booking" : "bookings"} · ${peopleCount} ${peopleCount === 1 ? "person" : "people"} in total`}
          </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {pdfState === "error" && <span style={{ fontSize: "0.78rem", color: "var(--danger)" }}>Download failed, try again</span>}
            <button className="primary-btn" onClick={downloadPdf} disabled={pdfState === "loading" || loading}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 1.5v7.5M3.8 6.2L7 9.3l3.2-3.1M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {pdfState === "loading" ? "Preparing PDF…" : "Download PDF"}
            </button>
          </div>
        </div>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}>
          {loading ? (
            <div className="pulsing" style={{ padding: "3rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }}>
              Loading participants…
            </div>
          ) : error ? (
            <div style={{ padding: "1.5rem", color: "var(--danger)", fontSize: "0.85rem", background: "var(--danger-bg)", borderRadius: "var(--radius-sm)", margin: "1rem", border: "1px solid var(--danger-border)" }}>
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }}>
              No confirmed participants yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    {["#", "Booked by", "Phone", "Email", "Guests", "Total people", "Booking"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((o, i) => {
                    const guests = o.guestDetails ?? [];
                    const open = expanded.has(o.id);
                    return (
                      <Fragment key={o.id}>
                        <tr>
                          <td className="cell-idx">
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                              {(page - 1) * PAGE_SIZE + i + 1}
                            </span>
                          </td>
                          <td className="cell-main" style={{ fontWeight: 500 }}>{[o.firstName, o.lastName].filter(Boolean).join(" ") || "—"}</td>
                          <td data-label="Phone" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>{o.phone ?? "—"}</td>
                          <td data-label="Email" style={{ color: "var(--ink-3)", fontSize: "0.8rem" }}>{o.email}</td>
                          <td data-label="Guests">
                            {guests.length > 0 ? (
                              <button className="guest-btn" aria-expanded={open} onClick={() => toggle(o.id)}>
                                +{guests.length} {guests.length === 1 ? "guest" : "guests"}
                                <svg className="chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                                  <path d="M2 3.5L5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            ) : (
                              <span style={{ color: "var(--ink-4)", fontSize: "0.8rem" }}>No guests</span>
                            )}
                          </td>
                          <td data-label="Total people" style={{ fontWeight: 600 }}>{1 + guests.length}</td>
                          <td data-label="Booking">
                            <OrderCode id={o.id} code={o.orderNumber} />
                          </td>
                        </tr>
                        {open && guests.map((g, gi) => (
                          <tr key={gi} className="guest-row">
                            <td />
                            <td style={{ paddingLeft: "1.75rem", color: "var(--ink-2)" }}>
                              <span style={{ color: "var(--ink-4)", marginRight: "0.4rem" }}>↳</span>
                              {[g.firstName, g.lastName].filter(Boolean).join(" ") || "—"}
                            </td>
                            <td style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>{g.phone ?? "—"}</td>
                            <td colSpan={4} style={{ color: "var(--ink-4)", fontSize: "0.78rem" }}>
                              Guest {gi + 1} of {o.firstName}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              <Pagination page={page} pageSize={PAGE_SIZE} total={orders.length} onChange={setPage} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
