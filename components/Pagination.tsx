"use client";

// Page numbers to show: first, last, and the current page ±1, with gaps marked by null ("…").
function pageList(page: number, pageCount: number): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== null) pages.push(null);
  }
  return pages;
}

// Footer pager for table cards. Renders nothing when everything fits on one page.
export default function Pagination({ page, pageSize, total, onChange }: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  return (
    <>
      <style>{`
        .pg-bar {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
          padding: 0.85rem 1rem; border-top: 1px solid var(--border); background: var(--surface-2);
          font-size: 0.82rem; color: var(--ink-3);
        }
        .pg-bar b { color: var(--ink); font-weight: 600; }
        .pg-nums { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
        .pg-btn {
          min-width: 36px; height: 36px; padding: 0 0.75rem;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;
          border-radius: var(--radius-sm); border: 1px solid var(--border-2);
          background: var(--surface); color: var(--ink-2);
          font-size: 0.85rem; font-weight: 600; cursor: pointer;
          box-shadow: var(--shadow);
          transition: all var(--transition);
        }
        .pg-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
        .pg-btn.on { background: var(--accent); border-color: var(--accent); color: #fff; }
        .pg-btn:disabled { opacity: 0.4; cursor: default; box-shadow: none; }
        .pg-gap { min-width: 24px; text-align: center; color: var(--ink-4); }
      `}</style>
      <div className="pg-bar">
        <span>
          Showing <b>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</b> of <b>{total}</b>
        </span>
        <nav className="pg-nums" aria-label="Pagination">
          <button className="pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
            ‹ Prev
          </button>
          {pageList(page, pageCount).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="pg-gap">…</span>
            ) : (
              <button
                key={p}
                className={`pg-btn${p === page ? " on" : ""}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            ),
          )}
          <button className="pg-btn" disabled={page === pageCount} onClick={() => onChange(page + 1)} aria-label="Next page">
            Next ›
          </button>
        </nav>
      </div>
    </>
  );
}
