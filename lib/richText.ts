/**
 * Lite-markdown used by RichTextField: bold (**), italic (_..._), bullet
 * lists (- / *), numbered lists (1.), blank-line paragraphs, single-newline
 * line breaks. Renders to a fixed whitelist of tags only — raw text is
 * HTML-escaped before any tag is added, so the output is safe to inject
 * with dangerouslySetInnerHTML without a sanitizer library.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

const BULLET_RE = /^[-*]\s+(.*)$/;
const NUMBERED_RE = /^\d+[.)]\s+(.*)$/;

export function renderRichText(raw: string | null | undefined): string {
  if (!raw) return "";

  // "<PARA>" is the legacy paragraph-break marker used by long-description
  // fields before the rich text toolbar existed; treat it like a blank line
  // so previously saved content keeps rendering correctly.
  const normalized = raw.replace(/\r\n/g, "\n").replace(/<PARA>/g, "\n\n");
  const blocks = normalized.split(/\n{2,}/);
  const html: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;

    if (lines.every((l) => BULLET_RE.test(l))) {
      const items = lines.map((l) => `<li>${renderInline(l.match(BULLET_RE)![1])}</li>`).join("");
      html.push(`<ul>${items}</ul>`);
    } else if (lines.every((l) => NUMBERED_RE.test(l))) {
      const items = lines.map((l) => `<li>${renderInline(l.match(NUMBERED_RE)![1])}</li>`).join("");
      html.push(`<ol>${items}</ol>`);
    } else {
      html.push(`<p>${lines.map(renderInline).join("<br>")}</p>`);
    }
  }

  return html.join("");
}