"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Nav from "@/components/Nav";
import { getOrder, refundOrder, reverseOrder, type ApiOrder } from "@/lib/api";
import { getToken } from "@/lib/auth";

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  paid:     { bg: "var(--success-bg)", text: "var(--success)" },
  pending:  { bg: "var(--warning-bg)", text: "var(--warning)" },
  failed:   { bg: "var(--surface-2)",  text: "var(--ink-3)" },
  refunded: { bg: "var(--surface-2)",  text: "var(--ink-3)" },
  reversed: { bg: "var(--surface-2)",  text: "var(--ink-3)" },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderId = Number(id);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"refund" | "reverse" | null>(null);
  const [confirm, setConfirm] = useState<"refund" | "reverse" | null>(null);

  async function load() {
    try {
      setOrder(await getOrder(getToken()!, orderId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [orderId]);

  async function runAction(action: "refund" | "reverse") {
    setConfirm(null);
    setBusy(action);
    setError(null);
    try {
      const updated = action === "refund"
        ? await refundOrder(getToken()!, orderId)
        : await reverseOrder(getToken()!, orderId);
      setOrder(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `${action} failed`);
    } finally {
      setBusy(null);
    }
  }

  if (!order) {
    return (
      <AuthGuard>
        <Nav />
        <main className="page-wrap">
          {error ? (
            <div style={{
              padding: "0.7rem 1rem",
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--danger)",
              fontSize: "0.82rem",
            }}>
              {error}
            </div>
          ) : (
            <div className="pulsing" style={{ color: "var(--ink-4)", fontSize: "0.875rem" }}>Loading…</div>
          )}
        </main>
      </AuthGuard>
    );
  }

  const canAct = order.status === "paid";
  const statusColor = STATUS_COLOR[order.status] ?? { bg: "var(--surface-2)", text: "var(--ink-3)" };

  return (
    <AuthGuard>
      <Nav />
      <main className="page-wrap">
        <div style={{ maxWidth: 720 }}>
          <Link href="/orders" style={{ fontSize: "0.78rem", color: "var(--ink-4)", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.85rem", transition: "color 0.14s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-4)")}>
            ← Orders
          </Link>

          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "1.85rem", fontWeight: 600,
              lineHeight: 1, letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}>
              {order.eventTitle?.en ?? order.eventSlug}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.5rem" }}>
              <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}>
                Order {order.orderNumber}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center",
                background: statusColor.bg, color: statusColor.text,
                padding: "0.18rem 0.55rem", borderRadius: 100,
                fontSize: "0.71rem", fontWeight: 600,
                letterSpacing: "0.04em", textTransform: "capitalize",
              }}>
                {order.status}
              </span>
            </div>
          </div>

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

          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: "1.25rem 1.5rem",
            display: "grid",
            gap: "0.65rem",
          }}>
            <Row label="Customer" value={`${order.firstName} ${order.lastName ?? ""}`} />
            <Row label="Email" value={order.email} />
            <Row label="Phone" value={order.phone ?? "—"} />
            <Row label="Guests" value={String(order.guests)} />
            <Row label="Amount" value={`${order.currency} ${(order.amount / 100).toLocaleString()}`} />
            <Row label="Card" value={order.panMasked ?? "—"} />
            <Row label="Paid at" value={order.paymentDate ? new Date(order.paymentDate).toLocaleString() : "—"} />
            <Row label="Gateway result" value={order.actionCodeDescription ?? "—"} />
            {order.notes && <Row label="Notes" value={order.notes} />}
          </div>

          {canAct && (
            <div style={{ display: "flex", gap: "0.85rem", marginTop: "1.5rem" }}>
              <button disabled={!!busy} onClick={() => setConfirm("refund")} className="danger-btn">
                {busy === "refund" ? "Refunding…" : "Refund"}
              </button>
              <button disabled={!!busy} onClick={() => setConfirm("reverse")} className="danger-btn">
                {busy === "reverse" ? "Reversing…" : "Reverse"}
              </button>
            </div>
          )}

          {confirm && (
            <div style={{
              marginTop: "1rem",
              padding: "1rem 1.25rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--surface-2)",
            }}>
              <p style={{ marginBottom: "0.85rem", fontSize: "0.875rem", color: "var(--ink)" }}>
                {confirm === "refund"
                  ? "Refund this order? The customer will be credited the full amount."
                  : "Reverse this order? This cancels an unsettled authorization."}
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => runAction(confirm)} className="danger-btn">Confirm {confirm}</button>
                <button onClick={() => setConfirm(null)} className="secondary-btn">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .danger-btn {
            padding: 0.55rem 1.15rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            border: 1px solid var(--danger);
            background: var(--danger);
            color: #fff;
            font-size: 0.845rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            transition: opacity var(--transition);
          }
          .danger-btn:hover { opacity: 0.85; }
          .danger-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .secondary-btn {
            padding: 0.55rem 1.15rem;
            border-radius: var(--radius-sm);
            cursor: pointer;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--ink-2);
            font-size: 0.845rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            transition: border-color var(--transition), color var(--transition);
          }
          .secondary-btn:hover { border-color: var(--ink-3); color: var(--ink); }
        `}</style>
      </main>
    </AuthGuard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
      <span style={{ color: "var(--ink-4)", fontSize: "0.82rem" }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: "right", fontSize: "0.875rem", color: "var(--ink)" }}>{value}</span>
    </div>
  );
}
