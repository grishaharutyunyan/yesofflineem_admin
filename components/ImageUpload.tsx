"use client";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const url = await uploadImage(getToken()!, file);
      onChange(url);
    } catch (ex: any) {
      setErr(ex.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{
        fontSize: "0.78rem", fontWeight: 600,
        color: "var(--ink-2)", display: "block",
        marginBottom: "0.5rem", letterSpacing: "0.02em",
      }}>
        {label}
      </label>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/images/… or https://…"
          style={{
            flex: 1,
            padding: "0.55rem 0.75rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.845rem",
            color: "var(--ink)",
            background: "var(--surface)",
            outline: "none",
            transition: "border-color 0.14s",
            fontFamily: "var(--font-mono, monospace)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: "0.55rem 0.9rem",
            background: "var(--ink-2)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: uploading ? "default" : "pointer",
            whiteSpace: "nowrap",
            opacity: uploading ? 0.6 : 1,
            transition: "opacity 0.14s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => !uploading && (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = uploading ? "0.6" : "1")}
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </div>

      {err && (
        <div style={{ color: "var(--danger)", fontSize: "0.77rem", marginTop: "0.35rem" }}>{err}</div>
      )}

      {value && (
        <div style={{ marginTop: "0.75rem" }}>
          <img
            src={value}
            alt="preview"
            style={{
              maxWidth: 200, maxHeight: 120,
              objectFit: "cover",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              display: "block",
            }}
          />
        </div>
      )}
    </div>
  );
}
