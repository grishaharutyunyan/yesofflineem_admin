"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LocaleField from "./LocaleField";
import ImageUpload from "./ImageUpload";
import { uploadVideo } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { ApiVideo } from "@/lib/api";

export type VideoFormState = {
  title_en: string; title_hy: string;
  subtitle_en: string; subtitle_hy: string;
  url: string; thumbnailUrl: string; priority: string;
};

export function videoToForm(v: ApiVideo): VideoFormState {
  return {
    title_en: v.title.en, title_hy: v.title.hy,
    subtitle_en: v.subtitle.en, subtitle_hy: v.subtitle.hy,
    url: v.url, thumbnailUrl: v.thumbnailUrl ?? "", priority: String(v.priority),
  };
}

export function emptyVideoForm(): VideoFormState {
  return { title_en: "", title_hy: "", subtitle_en: "", subtitle_hy: "", url: "", thumbnailUrl: "", priority: "0" };
}

function formToDto(f: VideoFormState) {
  return {
    title: { en: f.title_en, hy: f.title_hy },
    subtitle: { en: f.subtitle_en, hy: f.subtitle_hy },
    url: f.url,
    thumbnailUrl: f.thumbnailUrl || null,
    priority: Number(f.priority),
  };
}

interface Props {
  initial?: ApiVideo;
  onSubmit: (dto: object) => Promise<void>;
}

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

export default function VideoForm({ initial, onSubmit }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<VideoFormState>(initial ? videoToForm(initial) : emptyVideoForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  function set(key: keyof VideoFormState, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function setLocale(prefix: string, lang: "en" | "hy", val: string) {
    setForm((p) => ({ ...p, [`${prefix}_${lang}`]: val }));
  }

  async function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const url = await uploadVideo(getToken()!, file);
      setForm((p) => ({ ...p, url }));
    } catch (ex: any) {
      setErr(ex.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      await onSubmit(formToDto(form));
      router.push("/videos");
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
        .form-input::placeholder { color: var(--ink-4); }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--ink);
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06);
        }
        .form-mono {
          font-family: var(--font-mono, monospace) !important;
          font-size: 0.82rem !important;
          background: #faf9f6 !important;
        }
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
        .upload-btn {
          padding: 0.52rem 0.9rem;
          background: var(--ink-2); color: #fff;
          border: none; border-radius: var(--radius-sm);
          font-size: 0.8rem; font-weight: 500;
          cursor: pointer; transition: opacity 0.14s;
          white-space: nowrap; flex-shrink: 0;
        }
        .upload-btn:hover:not(:disabled) { opacity: 0.8; }
        .upload-btn:disabled { opacity: 0.55; cursor: default; }
      `}</style>

      <form onSubmit={handleSubmit}>

        {/* 01 Titles */}
        <SectionCard number="01" title="Titles">
          <LocaleField label="Title" enValue={form.title_en} hyValue={form.title_hy} onChange={(l, v) => setLocale("title", l, v)} />
          <LocaleField label="Subtitle" enValue={form.subtitle_en} hyValue={form.subtitle_hy} onChange={(l, v) => setLocale("subtitle", l, v)} multiline rows={2} />
        </SectionCard>

        {/* 02 Video Source */}
        <SectionCard number="02" title="Video Source">
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
              URL (YouTube or uploaded path)
            </label>
            <input
              required value={form.url}
              onChange={(e) => set("url", e.target.value)}
              className="form-input form-mono"
              placeholder="https://youtube.com/watch?v=… or /uploads/videos/…"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--ink-4)" }}>Or upload a file:</span>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="upload-btn">
              {uploading ? "Uploading…" : "Upload video"}
            </button>
            <input ref={fileRef} type="file" accept="video/*" onChange={handleVideoFile} style={{ display: "none" }} />
          </div>

          {uploading && (
            <div style={{ color: "var(--ink-4)", fontSize: "0.77rem", marginTop: "0.5rem" }}>Uploading…</div>
          )}
        </SectionCard>

        {/* 03 Thumbnail & Order */}
        <SectionCard number="03" title="Thumbnail & Order">
          <ImageUpload label="Thumbnail" value={form.thumbnailUrl} onChange={(v) => set("thumbnailUrl", v)} />
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
              Priority <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--ink-4)" }}>(lower = first)</span>
            </label>
            <input
              type="number" min="0"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className="form-input form-mono"
              style={{ maxWidth: 130 }}
            />
          </div>
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
            {saving ? "Saving…" : initial ? "Save changes" : "Create video"}
          </button>
          <button type="button" onClick={() => router.push("/videos")} className="form-btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
