import type { LocaleText, LocaleStringList, ScheduleItem } from "./api";

export type Lang = "en" | "hy";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function pickLocaleText(
  value: LocaleText | null | undefined,
  lang: Lang,
): string {
  if (!isRecord(value)) return "";
  const en = typeof value.en === "string" ? value.en : "";
  const hy = typeof value.hy === "string" ? value.hy : "";
  if (lang === "hy" && hy.trim()) return hy;
  return en;
}

export function pickLocaleList(
  value: LocaleStringList | null | undefined,
  lang: Lang,
): string[] {
  if (!isRecord(value)) return [];
  const en = Array.isArray(value.en)
    ? value.en.filter((x): x is string => typeof x === "string")
    : [];
  const hy = Array.isArray(value.hy)
    ? value.hy.filter((x): x is string => typeof x === "string")
    : [];
  if (lang === "hy" && hy.length) return hy;
  return en;
}

/**
 * Formats a schedule time string per locale.
 * Structured formats ("YYYY-MM-DD HH:mm" or "HH:mm–HH:mm" variants) are
 * converted to locale-aware display text. Everything else passes through.
 */
export function formatScheduleTime(time: string, lang: Lang): string {
  if (!time) return time;

  const dtMatch = time.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})(?:–(\d{2}:\d{2}))?$/);
  if (dtMatch) {
    const [, dateStr, startTime, endTime] = dtMatch;
    const d = new Date(dateStr + "T12:00:00");
    const timeRange = endTime ? `${startTime}–${endTime}` : startTime;
    const datePart = new Intl.DateTimeFormat(lang === "hy" ? "hy-AM" : "en-US", {
      month: "long",
      day: "numeric",
    }).format(d);
    return `${datePart}, ${timeRange}`;
  }

  return time;
}

export function pickScheduleForLang(
  schedule: ScheduleItem[] | null | undefined,
  lang: Lang,
): { time: string; label: string; sub: string }[] {
  if (!Array.isArray(schedule)) return [];
  return schedule.map((item) => ({
    time: formatScheduleTime(typeof item?.time === "string" ? item.time : "", lang),
    label: pickLocaleText(item?.label, lang),
    sub: pickLocaleText(item?.sub, lang),
  }));
}

export function spotsLeft(maxCapacity: number, bookedCount: number): number {
  return Math.max(0, maxCapacity - bookedCount);
}

export function formatAmd(price: number): string {
  if (price === 0) return "0";
  return price.toLocaleString("en-US");
}
