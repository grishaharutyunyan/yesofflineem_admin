"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { access_token, user } = await login(email, password);
      setAuth(access_token, user);
      router.push("/events");
    } catch (ex: any) {
      setErr(ex.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .login-wrap {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .login-card {
          width: 100%;
          max-width: 360px;
          animation: fadeUp 0.3s ease forwards;
        }
        .login-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          background: var(--surface);
          color: var(--ink);
          transition: border-color var(--transition), box-shadow var(--transition);
          outline: none;
        }
        .login-field::placeholder { color: var(--ink-4); }
        .login-field:focus {
          border-color: var(--ink);
          box-shadow: 0 0 0 3px rgba(10,10,10,0.07);
        }
        .login-submit {
          width: 100%;
          padding: 0.7rem;
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
        .login-submit:hover:not(:disabled) { opacity: 0.82; }
        .login-submit:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <div className="login-wrap">
        <div className="login-card">

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "2.4rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 46, height: 46, background: "var(--ink)",
              borderRadius: 11, marginBottom: "1.1rem",
            }}>
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M10.5 3a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" stroke="white" strokeWidth="1.4"/>
                <path d="M10.5 6.5v4l2.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "2rem", fontWeight: 400, lineHeight: 1,
              letterSpacing: "-0.01em", color: "var(--ink)",
            }}>
              <span style={{ fontWeight: 300 }}>yes</span>
              <span style={{ fontWeight: 700 }}>offline</span>
              <span style={{ fontWeight: 300, fontStyle: "italic", color: "var(--ink-3)" }}>em</span>
            </div>
            <div style={{
              marginTop: "0.4rem",
              fontSize: "0.63rem", letterSpacing: "0.22em",
              textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 500,
            }}>
              Admin Studio
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem 1.75rem 2rem",
            boxShadow: "var(--shadow-md)",
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "0.9rem" }}>
                <label style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  letterSpacing: "0.04em", color: "var(--ink-2)",
                  display: "block", marginBottom: "0.4rem",
                }}>
                  Email address
                </label>
                <input
                  className="login-field"
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required autoFocus
                  placeholder="admin@yesoffline.am"
                />
              </div>

              <div style={{ marginBottom: "1.4rem" }}>
                <label style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  letterSpacing: "0.04em", color: "var(--ink-2)",
                  display: "block", marginBottom: "0.4rem",
                }}>
                  Password
                </label>
                <input
                  className="login-field"
                  type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required placeholder="••••••••"
                />
              </div>

              {err && (
                <div style={{
                  color: "var(--danger)", fontSize: "0.8rem",
                  marginBottom: "1rem",
                  padding: "0.55rem 0.8rem",
                  background: "var(--danger-bg)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--danger-border)",
                }}>
                  {err}
                </div>
              )}

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
