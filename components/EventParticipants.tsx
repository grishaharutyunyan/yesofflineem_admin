"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrders, type ApiOrder } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Person {
  key: string;
  index: number;
  name: string;
  phone: string;
  email: string | null;
  orderId: number;
  orderNumber: string;
  firstInBooking: boolean;
}

function fullName(firstName: string, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

// Expands paid orders into one row per person: the buyer is the primary
// attendee, and guestDetails holds the additional guests.
function expandParticipants(orders: ApiOrder[]): Person[] {
  const people: Person[] = [];
  let index = 0;
  for (const o of orders) {
    const buyerName = fullName(o.firstName, o.lastName);
    people.push({
      key: `${o.id}-buyer`,
      index: ++index,
      name: buyerName || "—",
      phone: o.phone ?? "—",
      email: o.email,
      orderId: o.id,
      orderNumber: o.orderNumber,
      firstInBooking: true,
    });
    for (const [i, g] of (o.guestDetails ?? []).entries()) {
      people.push({
        key: `${o.id}-guest-${i}`,
        index: ++index,
        name: fullName(g.firstName, g.lastName) || "—",
        phone: g.phone ?? "—",
        email: null,
        orderId: o.id,
        orderNumber: o.orderNumber,
        firstInBooking: false,
      });
    }
  }
  return people;
}

export default function EventParticipants({ eventId }: { eventId: number }) {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getOrders(getToken()!, `eventId=${eventId}&status=paid&range=${encodeURIComponent(JSON.stringify([1, 10000]))}`)
      .then((data) => { if (alive) setOrders(data.items); })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : "Failed to load participants"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [eventId]);

  const people = expandParticipants(orders);

  return (
    <>
      <style>{`
        .participants-tbl { width: 100%; border-collapse: collapse; }
        .participants-tbl th {
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
        .participants-tbl td {
          padding: 0.72rem 1rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.855rem;
          color: var(--ink);
          vertical-align: middle;
        }
        .participants-tbl tbody tr:last-child td { border-bottom: none; }
        .participants-tbl tbody tr:hover td { background: #faf8f4; }
      `}</style>

      <section style={{ marginTop: "2.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{
            fontFamily: "var(--font-cormorant, serif)",
            fontSize: "1.4rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.01em",
          }}>
            Participants
          </h2>
          <p style={{ color: "var(--ink-4)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
            {loading
              ? "Loading…"
              : `${people.length} ${people.length === 1 ? "person" : "people"} across ${orders.length} ${orders.length === 1 ? "booking" : "bookings"}`}
          </p>
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
          ) : people.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.875rem" }}>
              No confirmed participants yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="participants-tbl">
                <thead>
                  <tr>
                    {["#", "Name", "Phone", "Email", "Booking"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.key}>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "var(--ink-4)" }}>
                          {p.index}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>{p.phone}</td>
                      <td style={{ color: "var(--ink-4)", fontSize: "0.8rem" }}>{p.email ?? ""}</td>
                      <td>
                        {p.firstInBooking ? (
                          <Link href={`/orders/${p.orderId}`} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "var(--ink-3)" }}>
                            {p.orderNumber}
                          </Link>
                        ) : (
                          <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem" }}>↳</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
