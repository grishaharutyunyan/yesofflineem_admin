"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { logout, getUnreadCounts, UNREAD_CHANGED } from "@/lib/api";

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" aria-hidden>
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
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10 5.8l3.5-2v7.4L10 9.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1" y="2.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 12.5l1.5-1H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 6h7M4 8.5h4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="2" y="1.5" width="11" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 5h6M4.5 7.5h6M4.5 10h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
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

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 3v12" stroke="currentColor" strokeWidth="1.3"/>
      <path d={collapsed ? "M10.5 7.5L12 9l-1.5 1.5" : "M12 7.5L10.5 9l1.5 1.5"} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/events", label: "Events", Icon: CalendarIcon },
  { href: "/videos", label: "Videos", Icon: VideoIcon },
  { href: "/messages", label: "Messages", Icon: MessageIcon },
  { href: "/orders", label: "Orders", Icon: OrdersIcon },
];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "var(--accent)",
        boxShadow: "0 2px 8px rgba(79,70,229,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 2.5a5 5 0 100 10 5 5 0 000-10z" stroke="#fff" strokeWidth="1.3"/>
          <path d="M7.5 5v2.5l2 2" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="nav-label">
        <div style={{
          fontFamily: "var(--font-cormorant, serif)",
          fontSize: "1.05rem", lineHeight: 1,
          color: "#fff",
          letterSpacing: "0.01em",
        }}>
          <span style={{ fontWeight: 300 }}>yes</span>
          <span style={{ fontWeight: 700 }}>offline</span>
          <span style={{ fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.38)" }}>em</span>
        </div>
        <div style={{
          fontSize: "0.6rem", letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", fontWeight: 500,
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
  const [collapsed, setCollapsed] = useState(false);
  const [unread, setUnread] = useState(0);

  // Unread messages badge: refresh on load, every minute, and when the messages page changes read state.
  useEffect(() => {
    const refresh = () => getUnreadCounts().then((c) => setUnread(c.total)).catch(() => {});
    refresh();
    const id = setInterval(refresh, 60_000);
    window.addEventListener(UNREAD_CHANGED, refresh);
    return () => { clearInterval(id); window.removeEventListener(UNREAD_CHANGED, refresh); };
  }, []);

  // Restore the desktop collapse preference; the data attribute drives --sidebar-w in globals.css.
  useEffect(() => {
    try { setCollapsed(localStorage.getItem("nav-collapsed") === "1"); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.nav = collapsed ? "collapsed" : "open";
    try { localStorage.setItem("nav-collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

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
          gap: 0.75rem;
          padding: 0.62rem 0.75rem;
          border-radius: 8px;
          font-size: 0.95rem;
          white-space: nowrap;
          color: var(--sidebar-ink);
          background: transparent;
          transition: color 0.14s, background 0.14s;
          margin-bottom: 2px;
          letter-spacing: 0.01em;
        }
        .nav-item:hover { color: var(--sidebar-ink-active); background: var(--sidebar-hover); }
        .nav-item { position: relative; }
        .nav-item.active { color: var(--sidebar-ink-active); background: var(--sidebar-active); font-weight: 600; }
        .nav-item.active::before {
          content: ""; position: absolute; left: -0.6rem; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0; background: var(--accent);
        }
        .nav-item.active svg { color: #a5b4fc; }
        .nav-item .dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          margin-left: auto;
          opacity: 0;
        }
        .nav-item.active .dot { opacity: 1; }
        .nav-badge {
          margin-left: auto; min-width: 20px; height: 20px; padding: 0 6px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 100px; background: var(--danger); color: #fff;
          font-size: 0.7rem; font-weight: 700; line-height: 1;
        }
        .nav-item:has(.nav-badge) .dot { display: none; }
        .nav-icon-wrap { position: relative; display: inline-flex; }
        .nav-icon-dot {
          display: none; position: absolute; top: -3px; right: -4px;
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--danger); box-shadow: 0 0 0 2px var(--sidebar-bg);
        }
        .signout-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.28);
          cursor: pointer; padding: 0.25rem;
          border-radius: 5px; display: flex; align-items: center;
          transition: color 0.14s, background 0.14s;
        }
        .signout-btn:hover { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.06); }

        .nav-sidebar { transition: width 0.2s ease; overflow: hidden; }
        .nav-toggle {
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer; padding: 0.35rem;
          border-radius: 6px; display: flex; align-items: center;
          transition: color 0.14s, background 0.14s;
          flex-shrink: 0;
        }
        .nav-toggle:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.08); }

        /* Collapsed (icon-only) rail — desktop only */
        @media (min-width: 769px) {
          html[data-nav="collapsed"] .nav-label,
          html[data-nav="collapsed"] .nav-logo,
          html[data-nav="collapsed"] .nav-item .dot,
          html[data-nav="collapsed"] .nav-badge { display: none; }
          html[data-nav="collapsed"] .nav-icon-dot { display: block; }
          html[data-nav="collapsed"] .nav-head { justify-content: center; padding-inline: 0; }
          html[data-nav="collapsed"] .nav-item { justify-content: center; padding-inline: 0; }
          html[data-nav="collapsed"] .nav-foot { flex-direction: column; padding-inline: 0; }
        }

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
          .nav-toggle { display: none; }

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
          <span className="nav-icon-wrap">
            {open ? <XIcon /> : <HamburgerIcon />}
            {!open && unread > 0 && <span className="nav-icon-dot" style={{ display: "block" }} />}
          </span>
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
        <div className="nav-head" style={{
          padding: "1.2rem 0.9rem 1.1rem 1.2rem",
          borderBottom: "1px solid var(--sidebar-sep)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
        }}>
          <div className="nav-logo"><Logo /></div>
          <button
            className="nav-toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.85rem 0.6rem" }}>
          <div className="nav-label" style={{
            fontSize: "0.62rem", letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
            padding: "0.2rem 0.55rem 0.55rem",
          }}>
            Content
          </div>
          {links.map(({ href, label, Icon }) => {
            const active = path.startsWith(href);
            const badge = href === "/messages" && unread > 0 ? unread : 0;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item${active ? " active" : ""}`}
                onClick={() => setOpen(false)}
                title={badge ? `${label} — ${badge} unread` : label}
              >
                <span className="nav-icon-wrap">
                  <Icon />
                  {badge > 0 && <span className="nav-icon-dot" />}
                </span>
                <span className="nav-label">{label}</span>
                {badge > 0 && <span className="nav-badge" aria-label={`${badge} unread`}>{badge > 99 ? "99+" : badge}</span>}
                <span className="dot" />
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="nav-foot" style={{
          padding: "0.85rem 1rem",
          borderTop: "1px solid var(--sidebar-sep)",
          display: "flex", alignItems: "center", gap: "0.55rem",
        }}>
          <Link
            href="/account"
            title="Account settings"
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: path === "/account" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.55)",
              flexShrink: 0, letterSpacing: "0.02em",
              textDecoration: "none", transition: "background 0.14s",
            }}
          >
            {initial}
          </Link>
          <div className="nav-label" style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.78rem", color: "rgba(255,255,255,0.35)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.email ?? ""}
            </div>
          </div>
          <button
            className="signout-btn"
            onClick={() => { logout().then(() => router.push("/login")); }}
            title="Sign out"
          >
            <SignOutIcon />
          </button>
        </div>
      </aside>
    </>
  );
}