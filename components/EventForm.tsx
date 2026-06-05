"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LocaleField from "./LocaleField";
import ImageUpload from "./ImageUpload";
import GalleryUpload from "./GalleryUpload";
import type { ApiEvent } from "@/lib/api";

const STATUS_OPTIONS = ["draft", "active", "archived"];

const defaultSchedule = JSON.stringify(
  [{ time: "00:00", label: { en: "", hy: "" }, sub: { en: "", hy: "" } }],
  null, 2
);
const defaultHost = JSON.stringify(
  { name: { en: "", hy: "" }, role: { en: "", hy: "" }, imageUrl: null },
  null, 2
);
const defaultCoords = JSON.stringify(
  { lat: 40.1872, lng: 44.5152, address: { en: "", hy: "" } },
  null, 2
);

export type EventFormState = {
  slug: string; status: string;
  label_en: string; label_hy: string;
  title_en: string; title_hy: string;
  dates_start: string; dates_end: string;
  location_en: string; location_hy: string;
  locationDetail_en: string; locationDetail_hy: string;
  shortDescription_en: string; shortDescription_hy: string;
  longDescription_en: string; longDescription_hy: string;
  includes_en: string; includes_hy: string;
  schedule_json: string; host_json: string; coordinates_json: string;
  maxCapacity: string; bookedCount: string; price: string;
  cardImageUrl: string; galleryUrls: string[];
};

export function eventToForm(ev: ApiEvent): EventFormState {
  return {
    slug: ev.slug, status: ev.status,
    label_en: ev.label.en, label_hy: ev.label.hy,
    title_en: ev.title.en, title_hy: ev.title.hy,
    dates_start: ev.dates.start, dates_end: ev.dates.end,
    location_en: ev.location.en, location_hy: ev.location.hy,
    locationDetail_en: ev.locationDetail.en, locationDetail_hy: ev.locationDetail.hy,
    shortDescription_en: ev.shortDescription.en, shortDescription_hy: ev.shortDescription.hy,
    longDescription_en: ev.longDescription.en, longDescription_hy: ev.longDescription.hy,
    includes_en: ev.includes.en.join("\n"), includes_hy: ev.includes.hy.join("\n"),
    schedule_json: JSON.stringify(ev.schedule, null, 2),
    host_json: JSON.stringify(ev.host, null, 2),
    coordinates_json: JSON.stringify(ev.coordinates, null, 2),
    maxCapacity: String(ev.maxCapacity), bookedCount: String(ev.bookedCount), price: String(ev.price),
    cardImageUrl: ev.cardImageUrl ?? "", galleryUrls: ev.galleryImageUrls ?? [],
  };
}

export function emptyForm(): EventFormState {
  return {
    slug: "", status: "draft",
    label_en: "", label_hy: "",
    title_en: "", title_hy: "",
    dates_start: "", dates_end: "",
    location_en: "", location_hy: "",
    locationDetail_en: "", locationDetail_hy: "",
    shortDescription_en: "", shortDescription_hy: "",
    longDescription_en: "", longDescription_hy: "",
    includes_en: "", includes_hy: "",
    schedule_json: defaultSchedule, host_json: defaultHost, coordinates_json: defaultCoords,
    maxCapacity: "10", bookedCount: "0", price: "0",
    cardImageUrl: "", galleryUrls: [],
  };
}

export function formToDto(f: EventFormState) {
  return {
    slug: f.slug,
    status: f.status,
    label: { en: f.label_en, hy: f.label_hy },
    title: { en: f.title_en, hy: f.title_hy },
    dates: { start: f.dates_start, end: f.dates_end },
    location: { en: f.location_en, hy: f.location_hy },
    locationDetail: { en: f.locationDetail_en, hy: f.locationDetail_hy },
    shortDescription: { en: f.shortDescription_en, hy: f.shortDescription_hy },
    longDescription: { en: f.longDescription_en, hy: f.longDescription_hy },
    includes: {
      en: f.includes_en.split("\n").map((s) => s.trim()).filter(Boolean),
      hy: f.includes_hy.split("\n").map((s) => s.trim()).filter(Boolean),
    },
    schedule: JSON.parse(f.schedule_json),
    host: JSON.parse(f.host_json),
    coordinates: JSON.parse(f.coordinates_json),
    maxCapacity: Number(f.maxCapacity),
    bookedCount: Number(f.bookedCount),
    price: Number(f.price),
    cardImageUrl: f.cardImageUrl || null,
    galleryImageUrls: f.galleryUrls.length ? f.galleryUrls : null,
  };
}

interface Props {
  initial?: ApiEvent;
  onSubmit: (dto: object) => Promise<void>;
}

const field: React.CSSProperties = { marginBottom: "1.1rem" };

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem", fontWeight: 600,
  color: "var(--ink-2)", display: "block",
  marginBottom: "0.4rem", letterSpacing: "0.02em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.875rem",
  background: "var(--surface)",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color 0.14s, box-shadow 0.14s",
};

const monoInputStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.82rem",
  resize: "vertical",
  lineHeight: 1.6,
  background: "#faf9f6",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.72rem", color: "var(--ink-4)", marginTop: "0.3rem",
};

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
          color: "var(--ink-4)", lineHeight: 1,
          letterSpacing: "-0.01em",
        }}>
          {number}
        </span>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--ink-3)",
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "1.25rem 1.4rem" }}>
        {children}
      </div>
    </div>
  );
}

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--ink)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10,10,10,0.06)";
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--border)";
  e.currentTarget.style.boxShadow = "none";
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
    setForm((p) => ({ ...p, [`${prefix}_${lang}`]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      JSON.parse(form.schedule_json);
      JSON.parse(form.host_json);
      JSON.parse(form.coordinates_json);
    } catch {
      setErr("Invalid JSON in Schedule, Host, or Coordinates field.");
      return;
    }
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
        .form-mono {
          font-family: var(--font-mono, monospace) !important;
          font-size: 0.8rem !important;
          background: #faf9f6 !important;
          resize: vertical;
          line-height: 1.65;
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
      `}</style>

      <form onSubmit={handleSubmit}>

        {/* 01 Basic */}
        <SectionCard number="01" title="Basic">
          <div className="form-row">
            <div style={field}>
              <label style={labelStyle}>Slug</label>
              <input required value={form.slug} onChange={(e) => set("slug", e.target.value)}
                className="form-input" placeholder="forest-retreat-june" />
            </div>
            <div style={field}>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="form-input form-select">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <LocaleField label="Label (short type)" enValue={form.label_en} hyValue={form.label_hy} onChange={(l, v) => setLocale("label", l, v)} />
          <LocaleField label="Title" enValue={form.title_en} hyValue={form.title_hy} onChange={(l, v) => setLocale("title", l, v)} />
        </SectionCard>

        {/* 02 Dates */}
        <SectionCard number="02" title="Dates">
          <div className="form-row">
            <div style={field}>
              <label style={labelStyle}>Start</label>
              <input required value={form.dates_start} onChange={(e) => set("dates_start", e.target.value)}
                className="form-input" placeholder="2026-06-14 18:00" />
            </div>
            <div style={field}>
              <label style={labelStyle}>End</label>
              <input required value={form.dates_end} onChange={(e) => set("dates_end", e.target.value)}
                className="form-input" placeholder="2026-06-16 15:00" />
            </div>
          </div>
        </SectionCard>

        {/* 03 Location */}
        <SectionCard number="03" title="Location">
          <LocaleField label="Location" enValue={form.location_en} hyValue={form.location_hy} onChange={(l, v) => setLocale("location", l, v)} />
          <LocaleField label="Location detail" enValue={form.locationDetail_en} hyValue={form.locationDetail_hy} onChange={(l, v) => setLocale("locationDetail", l, v)} />
          <div style={field}>
            <label style={labelStyle}>Coordinates (JSON)</label>
            <textarea
              value={form.coordinates_json}
              onChange={(e) => set("coordinates_json", e.target.value)}
              rows={5}
              className="form-input form-textarea form-mono"
            />
          </div>
        </SectionCard>

        {/* 04 Content */}
        <SectionCard number="04" title="Content">
          <LocaleField label="Short description" enValue={form.shortDescription_en} hyValue={form.shortDescription_hy} onChange={(l, v) => setLocale("shortDescription", l, v)} multiline rows={3} />
          <LocaleField label="Long description" enValue={form.longDescription_en} hyValue={form.longDescription_hy} onChange={(l, v) => setLocale("longDescription", l, v)} multiline rows={6} hint="Use <PARA> for paragraph breaks" />

          <div>
            <label style={labelStyle}>Includes</label>
            <p style={hintStyle}>One item per line for each language.</p>
            <div className="form-row" style={{ marginTop: "0.45rem" }}>
              <div>
                <div style={{ fontSize: "0.59rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "var(--ink)", padding: "0.12rem 0.38rem", borderRadius: 3, display: "inline-block", marginBottom: "0.3rem" }}>en</div>
                <textarea value={form.includes_en} onChange={(e) => set("includes_en", e.target.value)} rows={6}
                  className="form-input form-textarea"
                  placeholder={"Morning yoga\nForaging walk"} />
              </div>
              <div>
                <div style={{ fontSize: "0.59rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "var(--ink-3)", padding: "0.12rem 0.38rem", borderRadius: 3, display: "inline-block", marginBottom: "0.3rem" }}>hy</div>
                <textarea value={form.includes_hy} onChange={(e) => set("includes_hy", e.target.value)} rows={6}
                  className="form-input form-textarea" />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 05 Schedule */}
        <SectionCard number="05" title="Schedule">
          <p style={{ ...hintStyle, marginBottom: "0.65rem" }}>
            JSON array of <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{"{ time, label: { en, hy }, sub: { en, hy } }"}</code>
          </p>
          <textarea value={form.schedule_json} onChange={(e) => set("schedule_json", e.target.value)} rows={12}
            className="form-input form-textarea form-mono" />
        </SectionCard>

        {/* 06 Host */}
        <SectionCard number="06" title="Host">
          <p style={{ ...hintStyle, marginBottom: "0.65rem" }}>
            JSON: <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{"{ name: { en, hy }, role: { en, hy }, imageUrl }"}</code>
          </p>
          <textarea value={form.host_json} onChange={(e) => set("host_json", e.target.value)} rows={8}
            className="form-input form-textarea form-mono" />
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

        {/* Error */}
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

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
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
