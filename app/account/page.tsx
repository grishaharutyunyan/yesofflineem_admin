"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/api";
import { getToken, getUser, clearAuth } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const user = getUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Sign out after password change so the user re-authenticates
      setTimeout(() => { clearAuth(); router.push("/login"); }, 1800);
    } catch (ex: any) {
      setError(ex.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .account-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          background: var(--surface);
          color: var(--ink);
          transition: border-color var(--transition), box-shadow var(--transition);
          outline: none;
          box-sizing: border-box;
        }
        .account-field::placeholder { color: var(--ink-4); }
        .account-field:focus {
          border-color: var(--ink);
          box-shadow: 0 0 0 3px rgba(10,10,10,0.07);
        }
        .account-btn {
          padding: 0.62rem 1.4rem;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: opacity var(--transition);
        }
        .account-btn:hover:not(:disabled) { opacity: 0.82; }
        .account-btn:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "1.35rem", fontWeight: 600,
            color: "var(--ink)", margin: 0, letterSpacing: "-0.01em",
          }}>
            Account
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginTop: "0.3rem" }}>
            {user?.email}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--ink-3)", marginBottom: "1.25rem",
          }}>
            Change password
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", marginBottom: "1.4rem" }}>
              <div>
                <label style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  letterSpacing: "0.04em", color: "var(--ink-2)",
                  display: "block", marginBottom: "0.4rem",
                }}>
                  Current password
                </label>
                <input
                  className="account-field"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  letterSpacing: "0.04em", color: "var(--ink-2)",
                  display: "block", marginBottom: "0.4rem",
                }}>
                  New password
                </label>
                <input
                  className="account-field"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  letterSpacing: "0.04em", color: "var(--ink-2)",
                  display: "block", marginBottom: "0.4rem",
                }}>
                  Confirm new password
                </label>
                <input
                  className="account-field"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <div style={{
                color: "var(--danger)", fontSize: "0.8rem",
                marginBottom: "1rem",
                padding: "0.55rem 0.8rem",
                background: "var(--danger-bg)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--danger-border)",
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                color: "#166534", fontSize: "0.8rem",
                marginBottom: "1rem",
                padding: "0.55rem 0.8rem",
                background: "#f0fdf4",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #bbf7d0",
              }}>
                Password changed. Signing you out…
              </div>
            )}

            <button className="account-btn" type="submit" disabled={loading || success}>
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}