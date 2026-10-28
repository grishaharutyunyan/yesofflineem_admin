"use client";
import { useEffect } from "react";

// Delete confirmation dialog shared by the list pages. Escape or a backdrop click cancels.
// title/body/confirmLabel turn it into a plain (non-destructive) "are you sure?" dialog.
export default function ConfirmDeleteModal({ kind, name, onCancel, onConfirm, title, body, confirmLabel }: {
  kind: string;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  body?: string;
  confirmLabel?: string;
}) {
  const danger = !confirmLabel;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <>
      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.4);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          z-index: 1000;
          animation: modalFade 0.12s ease;
        }
        .modal-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 12px 40px rgba(15,23,42,0.18);
          padding: 1.5rem;
          width: 100%; max-width: 400px;
          animation: modalUp 0.14s ease;
        }
        .modal-icon {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--danger-bg); color: var(--danger); margin-bottom: 1rem;
        }
        .modal-title { font-family: var(--font-heading); font-size: 1.1rem; font-weight: 650; color: var(--ink); margin: 0 0 0.4rem; }
        .modal-body { font-size: 0.875rem; color: var(--ink-3); margin: 0 0 1.4rem; line-height: 1.5; }
        .modal-body strong { color: var(--ink); font-weight: 600; }
        .modal-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }
        .btn-cancel {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-2);
          border-radius: var(--radius-sm);
          background: var(--surface); color: var(--ink-2);
          font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: all var(--transition);
        }
        .btn-cancel:hover { background: var(--surface-2); color: var(--ink); }
        .btn-confirm-del {
          padding: 0.5rem 1rem;
          border: 1px solid var(--danger);
          border-radius: var(--radius-sm);
          background: var(--danger); color: #fff;
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: opacity var(--transition);
        }
        .btn-confirm-del:hover { opacity: 0.88; }
        @keyframes modalFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalUp { from { transform: translateY(6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div className="modal-backdrop" onClick={onCancel}>
        <div className="modal-box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-del-title" onClick={(e) => e.stopPropagation()}>
          <div className="modal-icon" style={danger ? undefined : { background: "var(--surface-2)", color: "var(--accent)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              {danger
                ? <path d="M3.5 5h11M7.5 5V3.5h3V5M5 5l.7 9.5h6.6L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                : <><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7.2a2 2 0 113 1.7c-.6.4-1 .8-1 1.5M9 12.6v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>}
            </svg>
          </div>
          <p id="confirm-del-title" className="modal-title">{title ?? `Delete ${kind}?`}</p>
          <p className="modal-body">
            <strong>{name}</strong> {body ?? "will be permanently removed. This cannot be undone."}
          </p>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onCancel} autoFocus>Cancel</button>
            <button className={danger ? "btn-confirm-del" : "primary-btn"} onClick={onConfirm}>{confirmLabel ?? "Delete"}</button>
          </div>
        </div>
      </div>
    </>
  );
}
