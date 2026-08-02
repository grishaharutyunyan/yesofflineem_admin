import type { ApiEvent } from "./api";
import type { Lang } from "./event-i18n";
import { formatAmd, pickLocaleList, pickLocaleText, pickScheduleForLang, spotsLeft } from "./event-i18n";

const HY_MONTHS = [
  "Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս",
  "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր",
];

function computeDate(start: string, end: string, lang: Lang) {
  const [startDate, startTime] = start.split(" ");
  const [endDate, endTime] = end.split(" ");
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate + "T12:00:00");
  const sameDay = startDate === endDate;
  const sDay = s.getDate();
  const eDay = e.getDate();
  const year = s.getFullYear();
  const monthShort = s.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const hasTimes = !!startTime && !!endTime;

  if (lang === "hy") {
    const monthHy = HY_MONTHS[s.getMonth()];
    const display = sameDay
      ? `${sDay} ${monthHy}, ${year}`
      : `${sDay}–${eDay} ${monthHy}, ${year}`;
    let dateLong = display;
    if (hasTimes) {
      dateLong = sameDay
        ? `${display}, ${startTime} – ${endTime}`
        : `${sDay} ${monthHy} ${startTime} – ${eDay} ${monthHy} ${endTime}`;
    }
    const diffDays = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
    const duration = diffDays > 1 ? `${diffDays} օր` : "";
    return { display, dateLong, monthShort, day: String(sDay), duration };
  }

  const monthEn = s.toLocaleDateString("en-US", { month: "long" });
  const monthShortEn = s.toLocaleDateString("en-US", { month: "short" });
  const wdStart = s.toLocaleDateString("en-US", { weekday: "short" });
  const wdEnd = e.toLocaleDateString("en-US", { weekday: "short" });
  const display = sameDay
    ? `${monthEn} ${sDay}, ${year}`
    : `${monthEn} ${sDay}–${eDay}, ${year}`;
  let dateLong: string;
  if (hasTimes) {
    dateLong = sameDay
      ? `${wdStart} ${monthShortEn} ${sDay}, ${startTime} – ${endTime}`
      : `${wdStart} ${monthShortEn} ${sDay} at ${startTime} – ${wdEnd} ${monthShortEn} ${eDay} at ${endTime}`;
  } else {
    dateLong = sameDay
      ? `${wdStart} ${monthShortEn} ${sDay}`
      : `${wdStart} ${monthShortEn} ${sDay} – ${wdEnd} ${monthShortEn} ${eDay}`;
  }
  const diffDays = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  const duration = diffDays > 1 ? `${diffDays} days` : "";
  return { display, dateLong, monthShort, day: String(sDay), duration };
}

export interface EventView {
  id: number;
  slug: string;
  status: string;
  typeLabel: string;
  title: string;
  date: string;
  dateLong: string;
  monthShort: string;
  day: string;
  location: string;
  locationFull: string;
  duration: string;
  desc: string;
  longDesc: string;
  includes: string[];
  schedule: { time: string; label: string; sub: string }[];
  host: string;
  hostRole: string;
  hostImageUrl: string | null;
  mapAddress: string;
  mapQuery: string;
  lat: number;
  lng: number;
  guests: number;
  spotsLeft: number;
  price: number;
  priceStr: string;
  cardImage: string | null;
  galleryImages: string[] | null;
  ctaLabel: string | null;
  hostSectionTitle: string | null;
  goodToKnowTitle: string | null;
  goodToKnowText: string | null;
  goodToKnowTextTitle: string | null;
}

export function toEventView(ev: ApiEvent, lang: Lang): EventView {
  const address = pickLocaleText(ev.coordinates?.address, lang);
  const left = spotsLeft(ev.maxCapacity, ev.bookedCount);
  const dc = computeDate(ev.dates.start, ev.dates.end, lang);

  return {
    id: ev.id,
    slug: ev.slug,
    status: ev.status,
    typeLabel: pickLocaleText(ev.label, lang),
    title: pickLocaleText(ev.title, lang),
    date: dc.display,
    dateLong: dc.dateLong,
    monthShort: dc.monthShort,
    day: dc.day,
    duration: dc.duration,
    location: pickLocaleText(ev.location, lang),
    locationFull: pickLocaleText(ev.locationDetail, lang),
    desc: pickLocaleText(ev.shortDescription, lang),
    longDesc: pickLocaleText(ev.longDescription, lang),
    includes: pickLocaleList(ev.includes, lang),
    schedule: pickScheduleForLang(ev.schedule, lang),
    host: pickLocaleText(ev.host?.name, lang),
    hostRole: pickLocaleText(ev.host?.role, lang),
    hostImageUrl: ev.host?.imageUrl ?? null,
    mapAddress: address,
    mapQuery: address,
    lat: ev.coordinates?.lat ?? 0,
    lng: ev.coordinates?.lng ?? 0,
    guests: ev.maxCapacity,
    spotsLeft: left,
    price: ev.price,
    priceStr: formatAmd(ev.price),
    cardImage: ev.cardImageUrl,
    galleryImages: ev.galleryImageUrls,
    ctaLabel: ev.ctaLabel ? pickLocaleText(ev.ctaLabel, lang) : null,
    hostSectionTitle: ev.hostSectionTitle ? pickLocaleText(ev.hostSectionTitle, lang) : null,
    goodToKnowTitle: ev.goodToKnowTitle ? pickLocaleText(ev.goodToKnowTitle, lang) : null,
    goodToKnowText: ev.goodToKnowText ? pickLocaleText(ev.goodToKnowText, lang) : null,
    goodToKnowTextTitle: ev.goodToKnowTextTitle ? pickLocaleText(ev.goodToKnowTextTitle, lang) : null,
  };
}
