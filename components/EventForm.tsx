"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LocaleField from "./LocaleField";
import ImageUpload from "./ImageUpload";
import GalleryUpload from "./GalleryUpload";
import ScheduleBuilder from "./ScheduleBuilder";
import IncludesEditor, { type IncludeItem } from "./IncludesEditor";
import HostEditor from "./HostEditor";
import MapPicker from "./MapPicker";
import type { ApiEvent, EventCoordinates, EventHost, ScheduleItem } from "@/lib/api";

const STATUS_OPTIONS = ["draft", "active", "archived"];

function toDatetimeLocal(s: string): string {
  if (!s) return "";
  return s.replace(" ", "T").slice(0, 16);
}

function fromDatetimeLocal(s: string): string {
  if (!s) return "";
  return s.replace("T", " ");
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Form State ──────────────────────────────────────────────────────────────

export type EventFormState = {
  slug: string;
  status: string;
  label_en: string; label_hy: string;
  title_en: string; title_hy: string;
  dates_start: string; dates_end: string;
  location_en: string; location_hy: string;
  locationDetail_en: string; locationDetail_hy: string;
  shortDescription_en: string; shortDescription_hy: string;
  longDescription_en: string; longDescription_hy: string;
  includes: IncludeItem[];
  schedule: ScheduleItem[];
  host: EventHost;
  coordinates: EventCoordinates;
  maxCapacity: string; bookedCount: string; price: string;
  cardImageUrl: string; galleryUrls: string[];
  ctaLabel_en: string; ctaLabel_hy: string;
  hostSectionTitle_en: string; hostSectionTitle_hy: string;
  goodToKnowTitle_en: string; goodToKnowTitle_hy: string;
  goodToKnowText_en: string; goodToKnowText_hy: string;
};

export function eventToForm(ev: ApiEvent): EventFormState {
  const includes: IncludeItem[] = ev.includes.en.map((e, i) => ({
    en: e,
    hy: ev.includes.hy[i] ?? "",
  }));
  return {
    slug: ev.slug,
    status: ev.status,
    label_en: ev.label.en, label_hy: ev.label.hy,
    title_en: ev.title.en, title_hy: ev.title.hy,
    dates_start: toDatetimeLocal(ev.dates.start),
    dates_end: toDatetimeLocal(ev.dates.end),
    location_en: ev.location.en, location_hy: ev.location.hy,
    locationDetail_en: ev.locationDetail.en, locationDetail_hy: ev.locationDetail.hy,
    shortDescription_en: ev.shortDescription.en, shortDescription_hy: ev.shortDescription.hy,
    longDescription_en: ev.longDescription.en, longDescription_hy: ev.longDescription.hy,
    includes,
    schedule: ev.schedule,
    host: ev.host,
    coordinates: ev.coordinates,
    maxCapacity: String(ev.maxCapacity),
    bookedCount: String(ev.bookedCount),
    price: String(ev.price),
    cardImageUrl: ev.cardImageUrl ?? "",
    galleryUrls: ev.galleryImageUrls ?? [],
    ctaLabel_en: ev.ctaLabel?.en ?? "",
    ctaLabel_hy: ev.ctaLabel?.hy ?? "",
    hostSectionTitle_en: ev.hostSectionTitle?.en ?? "",
    hostSectionTitle_hy: ev.hostSectionTitle?.hy ?? "",
    goodToKnowTitle_en: ev.goodToKnowTitle?.en ?? "",
    goodToKnowTitle_hy: ev.goodToKnowTitle?.hy ?? "",
    goodToKnowText_en: ev.goodToKnowText?.en ?? "",
    goodToKnowText_hy: ev.goodToKnowText?.hy ?? "",
  };
}

export function emptyForm(): EventFormState {
  return {
    slug: "", status: "active",
    label_en: "", label_hy: "",
    title_en: "", title_hy: "",
    dates_start: "", dates_end: "",
    location_en: "", location_hy: "",
    locationDetail_en: "", locationDetail_hy: "",
    shortDescription_en: "", shortDescription_hy: "",
    longDescription_en: "", longDescription_hy: "",
    includes: [],
    schedule: [{ time: "", label: { en: "", hy: "" }, sub: { en: "", hy: "" } }],
    host: { name: { en: "", hy: "" }, role: { en: "", hy: "" }, imageUrl: null },
    coordinates: { lat: 40.1872, lng: 44.5152, address: { en: "", hy: "" } },
    maxCapacity: "10", bookedCount: "0", price: "0",
    cardImageUrl: "", galleryUrls: [],
    ctaLabel_en: "", ctaLabel_hy: "",
    hostSectionTitle_en: "", hostSectionTitle_hy: "",
    goodToKnowTitle_en: "", goodToKnowTitle_hy: "",
    goodToKnowText_en: "", goodToKnowText_hy: "",
  };
}

export function formToDto(f: EventFormState) {
  return {
    slug: f.slug,
    status: f.status,
    label: { en: f.label_en, hy: f.label_hy },
    title: { en: f.title_en, hy: f.title_hy },
    dates: {
      start: fromDatetimeLocal(f.dates_start),
      end: fromDatetimeLocal(f.dates_end),
    },
    location: { en: f.location_en, hy: f.location_hy },
    locationDetail: { en: f.locationDetail_en, hy: f.locationDetail_hy },
    shortDescription: { en: f.shortDescription_en, hy: f.shortDescription_hy },
    longDescription: { en: f.longDescription_en, hy: f.longDescription_hy },
    includes: {
      en: f.includes.map((i) => i.en).filter(Boolean),
      hy: f.includes.map((i) => i.hy).filter(Boolean),
    },
    schedule: f.schedule,
    host: f.host,
    coordinates: f.coordinates,
    maxCapacity: Number(f.maxCapacity),
    bookedCount: Number(f.bookedCount),
    price: Number(f.price),
    cardImageUrl: f.cardImageUrl || null,
    galleryImageUrls: f.galleryUrls.length ? f.galleryUrls : null,
    ctaLabel: (f.ctaLabel_en || f.ctaLabel_hy)
      ? { en: f.ctaLabel_en, hy: f.ctaLabel_hy }
      : null,
    hostSectionTitle: (f.hostSectionTitle_en || f.hostSectionTitle_hy)
      ? { en: f.hostSectionTitle_en, hy: f.hostSectionTitle_hy }
      : null,
    goodToKnowTitle: (f.goodToKnowTitle_en || f.goodToKnowTitle_hy)
      ? { en: f.goodToKnowTitle_en, hy: f.goodToKnowTitle_hy }
      : null,
    goodToKnowText: (f.goodToKnowText_en || f.goodToKnowText_hy)
      ? { en: f.goodToKnowText_en, hy: f.goodToKnowText_hy }
      : null,
  };
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      marginBottom: "1rem",
      boxShadow: "var(--shadow)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: "0.75rem",
        padding: "1rem 1.4rem 0.85rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}>
        <span style={{
          fontFamily: "var(--font-cormorant, serif)",
          fontSize: "1.15rem", fontWeight: 300,
          color: "var(--ink-4)", lineHeight: 1, letterSpacing: "-0.01em",
        }}>
          {number}
        </span>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)",
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "1.25rem 1.4rem" }}>{children}</div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem", fontWeight: 600,
  color: "var(--ink-2)", display: "block",
  marginBottom: "0.4rem", letterSpacing: "0.02em",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.72rem", color: "var(--ink-4)", marginTop: "0.3rem",
};

const field: React.CSSProperties = { marginBottom: "1.1rem" };

// ─── EventForm ────────────────────────────────────────────────────────────────

interface Props {
  initial?: ApiEvent;
  onSubmit: (dto: object) => Promise<void>;
}

export default function EventForm({ initial, onSubmit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormState>(initial ? eventToForm(initial) : emptyForm());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function set(key: keyof EventFormState, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function setLocale(prefix: string, lang: "en" | "hy", val: string) {
    setForm((p) => {
      const next: any = { ...p, [`${prefix}_${lang}`]: val };
      if (prefix === "title" && lang === "en" && !initial) {
        next.slug = toSlug(val);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      await onSubmit(formToDto(form));
      router.push("/events");
    } catch (ex: any) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.55rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          background: var(--surface);
          color: var(--ink);
          outline: none;
          transition: border-color 0.14s, box-shadow 0.14s;
          font-family: inherit;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: var(--ink-4); }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--ink);
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06);
        }
        .form-hint { font-size: 0.71rem; color: var(--ink-4); margin-top: 0.28rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .form-btn-primary {
          padding: 0.65rem 1.5rem;
          background: var(--ink); color: #fff;
          border: none; border-radius: var(--radius-sm);
          font-size: 0.875rem; font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer; transition: opacity 0.14s;
        }
        .form-btn-primary:hover:not(:disabled) { opacity: 0.82; }
        .form-btn-primary:disabled { opacity: 0.5; cursor: default; }
        .form-btn-ghost {
          padding: 0.65rem 1.25rem;
          background: var(--surface); color: var(--ink-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.875rem; font-weight: 500;
          cursor: pointer; transition: all 0.14s;
        }
        .form-btn-ghost:hover { border-color: var(--ink-2); color: var(--ink); }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          opacity: 0.5; cursor: pointer;
        }
        @media (max-width: 768px) {
          .form-row { grid-template-columns: 1fr; }
          .form-row-3 { grid-template-columns: 1fr; }
          .form-actions { flex-direction: column; }
          .form-actions button, .form-actions a { width: 100%; justify-content: center; }
        }
      `}</style>

      <form onSubmit={handleSubmit}>

        {/* 01 Basic */}
        <SectionCard number="01" title="Basic">
          <div style={field}>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="form-input form-select">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <LocaleField label="Label (short type)" enValue={form.label_en} hyValue={form.label_hy} onChange={(l, v) => setLocale("label", l, v)} />
          <LocaleField label="Title" enValue={form.title_en} hyValue={form.title_hy} onChange={(l, v) => setLocale("title", l, v)} />
        </SectionCard>

        {/* 02 Dates */}
        <SectionCard number="02" title="Dates">
          <div className="form-row">
            <div style={field}>
              <label style={labelStyle}>Start date & time</label>
              <input
                type="datetime-local"
                required
                value={form.dates_start}
                onChange={(e) => set("dates_start", e.target.value)}
                className="form-input"
              />
            </div>
            <div style={field}>
              <label style={labelStyle}>End date & time</label>
              <input
                type="datetime-local"
                required
                value={form.dates_end}
                onChange={(e) => set("dates_end", e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </SectionCard>

        {/* 03 Location */}
        <SectionCard number="03" title="Location">
          <LocaleField label="Location name" enValue={form.location_en} hyValue={form.location_hy} onChange={(l, v) => setLocale("location", l, v)} />
          <LocaleField label="Location detail" enValue={form.locationDetail_en} hyValue={form.locationDetail_hy} onChange={(l, v) => setLocale("locationDetail", l, v)} />
          <div style={{ ...field, marginTop: "0.75rem" }}>
            <label style={{ ...labelStyle, marginBottom: "0.65rem" }}>Map & Coordinates</label>
            <MapPicker
              value={form.coordinates}
              onChange={(v) => setForm((p) => ({ ...p, coordinates: v }))}
            />
          </div>
        </SectionCard>

        {/* 04 Content */}
        <SectionCard number="04" title="Content">
          <LocaleField label="Short description" enValue={form.shortDescription_en} hyValue={form.shortDescription_hy} onChange={(l, v) => setLocale("shortDescription", l, v)} multiline rows={3} />
          <LocaleField label="Long description" enValue={form.longDescription_en} hyValue={form.longDescription_hy} onChange={(l, v) => setLocale("longDescription", l, v)} multiline rows={6} hint="Use <PARA> for paragraph breaks" />

          <div style={{ marginTop: "0.85rem" }}>
            <label style={labelStyle}>What&apos;s Included</label>
            <p style={{ ...hintStyle, marginBottom: "0.65rem" }}>
              Toggle predefined items or add custom ones below. Each item is shown in both EN and HY.
            </p>
            <IncludesEditor
              value={form.includes}
              onChange={(v) => setForm((p) => ({ ...p, includes: v }))}
            />
          </div>
        </SectionCard>

        {/* 05 Schedule */}
        <SectionCard number="05" title="Schedule">
          <p style={{ ...hintStyle, marginBottom: "0.75rem" }}>
            Add schedule items with a time label (e.g. "Day 1", "09:00", "09:00–11:00") and an EN + HY description.
          </p>
          <ScheduleBuilder
            value={form.schedule}
            onChange={(v) => setForm((p) => ({ ...p, schedule: v }))}
          />
        </SectionCard>

        {/* 06 Host */}
        <SectionCard number="06" title="Host">
          <LocaleField
            label="Section title"
            enValue={form.hostSectionTitle_en}
            hyValue={form.hostSectionTitle_hy}
            onChange={(l, v) => setLocale("hostSectionTitle", l, v)}
            hint='default: "Your host"'
          />
          <HostEditor
            value={form.host}
            onChange={(v) => setForm((p) => ({ ...p, host: v }))}
          />
        </SectionCard>

        {/* 07 Capacity & Pricing */}
        <SectionCard number="07" title="Capacity & Pricing">
          <div className="form-row-3">
            {(["maxCapacity", "bookedCount", "price"] as const).map((k) => (
              <div key={k} style={field}>
                <label style={labelStyle}>
                  {k === "maxCapacity" ? "Max capacity" : k === "bookedCount" ? "Booked count" : "Price (AMD)"}
                </label>
                <input
                  type="number" min="0"
                  value={form[k]}
                  onChange={(e) => set(k, e.target.value)}
                  className="form-input"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 08 Images */}
        <SectionCard number="08" title="Images">
          <ImageUpload label="Card image" value={form.cardImageUrl} onChange={(v) => setForm((p) => ({ ...p, cardImageUrl: v }))} />
          <GalleryUpload urls={form.galleryUrls} onChange={(v) => setForm((p) => ({ ...p, galleryUrls: v }))} />
        </SectionCard>

        {/* 09 CTA Button */}
        <SectionCard number="09" title="CTA Button">
          <p style={{ ...hintStyle, marginBottom: "0.85rem" }}>
            Label for the &ldquo;View &amp; reserve&rdquo; button on the public events page.
            Leave blank to use the default text.
          </p>
          <LocaleField
            label="Button label"
            enValue={form.ctaLabel_en}
            hyValue={form.ctaLabel_hy}
            onChange={(l, v) => setLocale("ctaLabel", l, v)}
            hint='default: "View & reserve"'
          />
        </SectionCard>

        {/* 10 Good to Know */}
        <SectionCard number="10" title="Good to Know">
          <p style={{ ...hintStyle, marginBottom: "0.85rem" }}>
            Optional note shown on the event page sidebar. Leave blank to hide the section.
          </p>
          <LocaleField
            label="Section title"
            enValue={form.goodToKnowTitle_en}
            hyValue={form.goodToKnowTitle_hy}
            onChange={(l, v) => setLocale("goodToKnowTitle", l, v)}
            hint='e.g. "Good to know"'
          />
          <LocaleField
            label="Body text"
            enValue={form.goodToKnowText_en}
            hyValue={form.goodToKnowText_hy}
            onChange={(l, v) => setLocale("goodToKnowText", l, v)}
            multiline
            rows={3}
          />
        </SectionCard>

        {err && (
          <div style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.855rem",
            marginBottom: "1rem",
          }}>
            {err}
          </div>
        )}

        <div className="form-actions" style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
          <button type="submit" disabled={saving} className="form-btn-primary">
            {saving ? "Saving…" : initial ? "Save changes" : "Create event"}
          </button>
          <button type="button" onClick={() => router.push("/events")} className="form-btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}