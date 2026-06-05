"use client";
import { useRef, useState } from "react";
import { uploadImages } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Props {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export default function GalleryUpload({ urls, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setErr("");
    try {
      const newUrls = await uploadImages(getToken()!, files);
      onChange([...urls, ...newUrls]);
    } catch (ex: any) {
      setErr(ex.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(i: number) {
    onChange(urls.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{
        fontSize: "0.78rem", fontWeight: 600,
        color: "var(--ink-2)", display: "block",
        marginBottom: "0.5rem", letterSpacing: "0.02em",
      }}>
        Gallery images
        {urls.length > 0 && (
          <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--ink-4)", marginLeft: "0.4rem" }}>
            ({urls.length})
          </span>
        )}
      </label>

      {urls.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {urls.map((url, i) => (
            <div key={i} style={{ position: "relative", group: "true" } as React.CSSProperties}>
              <img
                src={url} alt=""
                style={{
                  width: 88, height: 58,
                  objectFit: "cover",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  display: "block",
                }}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                title="Remove"
                style={{
                  position: "absolute", top: -7, right: -7,
                  background: "var(--danger)", color: "#fff",
                  border: "2px solid var(--surface)",
                  borderRadius: "50%",
                  width: 20, height: 20,
                  fontSize: "0.7rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                  transition: "opacity 0.14s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {urls.length === 0 && (
        <div style={{
          border: "1.5px dashed var(--border-2)",
          borderRadius: "var(--radius-sm)",
          padding: "1.25rem",
          textAlign: "center",
          marginBottom: "0.65rem",
          background: "var(--surface-2)",
        }}>
          <p style={{ fontSize: "0.8rem", color: "var(--ink-4)" }}>No gallery images</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: "0.4rem 0.85rem",
          background: "var(--surface)",
          color: "var(--ink-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.8rem",
          fontWeight: 500,
          cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.6 : 1,
          transition: "all 0.14s",
        }}
        onMouseEnter={(e) => !uploading && (e.currentTarget.style.borderColor = "var(--ink)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        {uploading ? "Uploading…" : "+ Add images"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />

      {err && (
        <div style={{ color: "var(--danger)", fontSize: "0.77rem", marginTop: "0.35rem" }}>{err}</div>
      )}
    </div>
  );
}
