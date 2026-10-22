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

// Renders one blank-line-delimited block. Lines are grouped into runs by
// type (bullet / numbered / plain) rather than requiring every line in the
// block to match the same pattern, so a list still renders correctly even
// when it isn't isolated by its own blank line (e.g. an intro sentence
// immediately followed by "- item" lines).
function renderBlock(block: string): string {
  const lines = block.split("\n").filter((l) => l.trim() !== "");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    if (BULLET_RE.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && BULLET_RE.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].match(BULLET_RE)![1])}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
    } else if (NUMBERED_RE.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && NUMBERED_RE.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].match(NUMBERED_RE)![1])}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
    } else {
      const paraLines: string[] = [];
      while (i < lines.length && !BULLET_RE.test(lines[i]) && !NUMBERED_RE.test(lines[i])) {
        paraLines.push(lines[i]);
        i++;
      }
      html.push(`<p>${paraLines.map(renderInline).join("<br>")}</p>`);
    }
  }

  return html.join("");
}

export function renderRichText(raw: string | null | undefined): string {
  if (!raw) return "";

  // "<PARA>" is the legacy paragraph-break marker used by long-description
  // fields before the rich text toolbar existed; treat it like a blank line
  // so previously saved content keeps rendering correctly.
  const normalized = raw.replace(/\r\n/g, "\n").replace(/<PARA>/g, "\n\n");
  const blocks = normalized.split(/\n{2,}/);

  return blocks.map(renderBlock).join("");
}