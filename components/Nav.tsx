"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 1.5v2M10 1.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M1.5 6.5h12" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="3.5" y="8.5" width="2" height="2" rx="0.5" fill="currentColor"/>
      <rect x="6.5" y="8.5" width="2" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10 5.8l3.5-2v7.4L10 9.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M5.5 2H2.5a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M9 9.5L12.5 7 9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 7H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const links = [
  { href: "/events", label: "Events", Icon: CalendarIcon },
  { href: "/videos", label: "Videos", Icon: VideoIcon },
];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 2.5a5 5 0 100 10 5 5 0 000-10z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2"/>
          <path d="M7.5 5v2.5l2 2" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <div style={{
          fontFamily: "var(--font-cormorant, serif)",
          fontSize: "1.05rem", lineHeight: 1,
          color: "rgba(255,255,255,0.82)",
          letterSpacing: "0.01em",
        }}>
          <span style={{ fontWeight: 300 }}>yes</span>
          <span style={{ fontWeight: 700 }}>offline</span>
          <span style={{ fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.38)" }}>em</span>
        </div>
        <div style={{
          fontSize: "0.6rem", letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.22)", fontWeight: 500,
          marginTop: "0.12rem",
        }}>
          admin studio
        </div>
      </div>
    </div>
  );
}

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const user = getUser();
  const initial = user?.email?.[0]?.toUpperCase() ?? "A";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => { setOpen(false); }, [path]);

  return (
    <>
      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.48rem 0.65rem;
          border-radius: 7px;
          font-size: 0.855rem;
          color: var(--sidebar-ink);
          background: transparent;
          transition: color 0.14s, background 0.14s;
          margin-bottom: 2px;
          letter-spacing: 0.01em;
        }
        .nav-item:hover { color: var(--sidebar-ink-active); background: var(--sidebar-hover); }
        .nav-item.active { color: var(--sidebar-ink-active); background: var(--sidebar-active); font-weight: 500; }
        .nav-item .dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          margin-left: auto;
          opacity: 0;
        }
        .nav-item.active .dot { opacity: 1; }
        .signout-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.28);
          cursor: pointer; padding: 0.25rem;
          border-radius: 5px; display: flex; align-items: center;
          transition: color 0.14s, background 0.14s;
        }
        .signout-btn:hover { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.06); }

        /* Mobile top bar */
        .mob-topbar {
          display: none;
          position: fixed; top: 0; left: 0; right: 0;
          height: var(--topbar-h, 52px);
          background: var(--sidebar-bg);
          border-bottom: 1px solid var(--sidebar-sep);
          align-items: center; justify-content: space-between;
          padding: 0 1rem;
          z-index: 50;
        }
        .mob-burger {
          background: none; border: none;
          color: rgba(255,255,255,0.55);
          cursor: pointer; padding: 0.4rem;
          border-radius: 6px; display: flex; align-items: center;
          transition: color 0.14s, background 0.14s;
          flex-shrink: 0;
        }
        .mob-burger:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.08); }

        /* Backdrop */
        .nav-backdrop {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 39;
        }

        @media (max-width: 768px) {
          .mob-topbar { display: flex; }

          .nav-sidebar {
            transform: translateX(-100%);
            transition: transform 0.24s cubic-bezier(0.32, 0.72, 0, 1);
          }
          .nav-sidebar.nav-open {
            transform: translateX(0);
          }
          .nav-backdrop {
            display: none;
            animation: none;
          }
          .nav-backdrop.nav-open {
            display: block;
          }
        }
      `}</style>

      {/* Mobile top bar */}
      <div className="mob-topbar">
        <button className="mob-burger" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <XIcon /> : <HamburgerIcon />}
        </button>
        <Logo />
        <div style={{ width: 36, flexShrink: 0 }} />
      </div>

      {/* Backdrop */}
      <div className={`nav-backdrop${open ? " nav-open" : ""}`} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <aside
        className={`nav-sidebar${open ? " nav-open" : ""}`}
        style={{
          width: "var(--sidebar-w)", minHeight: "100vh",
          background: "var(--sidebar-bg)",
          display: "flex", flexDirection: "column",
          position: "fixed", left: 0, top: 0,
          borderRight: "1px solid var(--sidebar-sep)",
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: "1.4rem 1.2rem 1.2rem",
          borderBottom: "1px solid var(--sidebar-sep)",
        }}>
          <Logo />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.85rem 0.6rem" }}>
          <div style={{
            fontSize: "0.59rem", letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.18)",
            fontWeight: 600,
            padding: "0.2rem 0.55rem 0.55rem",
          }}>
            Content
          </div>
          {links.map(({ href, label, Icon }) => {
            const active = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item${active ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon />
                {label}
                <span className="dot" />
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: "0.85rem 1rem",
          borderTop: "1px solid var(--sidebar-sep)",
          display: "flex", alignItems: "center", gap: "0.55rem",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.55)",
            flexShrink: 0, letterSpacing: "0.02em",
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.72rem", color: "rgba(255,255,255,0.35)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.email ?? ""}
            </div>
          </div>
          <button
            className="signout-btn"
            onClick={() => { clearAuth(); router.push("/login"); }}
            title="Sign out"
          >
            <SignOutIcon />
          </button>
        </div>
      </aside>
    </>
  );
}