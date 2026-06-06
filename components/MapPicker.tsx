"use client";
import { useState } from "react";
import type { EventCoordinates } from "@/lib/api";

interface Props {
  value: EventCoordinates;
  onChange: (val: EventCoordinates) => void;
}

interface NomResult {
  lat: string;
  lon: string;
  display_name: string;
}

const labelSt: React.CSSProperties = {
  fontSize: "0.69rem",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  display: "block",
  marginBottom: "0.28rem",
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.875rem",
  background: "var(--surface)",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color 0.14s",
  fontFamily: "inherit",
};

export default function MapPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NomResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");

  async function search() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchErr("");
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!res.ok) throw new Error("Search failed");
      const data: NomResult[] = await res.json();
      if (data.length === 0) setSearchErr("No results found. Try a different query.");
      else setResults(data);
    } catch (e: any) {
      setSearchErr(e.message ?? "Search failed");
    } finally {
      setSearching(false);
    }
  }

  function pick(r: NomResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    onChange({ ...value, lat, lng, address: { ...value.address, en: r.display_name } });
    setResults([]);
    setQuery("");
  }

  function setCoord(field: "lat" | "lng", raw: string) {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange({ ...value, [field]: n });
  }

  function setAddr(lang: "en" | "hy", val: string) {
    onChange({ ...value, address: { ...value.address, [lang]: val } });
  }

  const hasCoords = value.lat !== 0 || value.lng !== 0;
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${value.lng - 0.025},${value.lat - 0.025},${value.lng + 0.025},${value.lat + 0.025}&layer=mapnik&marker=${value.lat},${value.lng}`
    : null;

  return (
    <div>
      {/* Search bar */}
      <div style={{ marginBottom: "0.75rem" }}>
        <label style={labelSt}>Search location</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); search(); } }}
            placeholder="Dilijan, Armenia"
            style={{ ...inp, flex: 1 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          <button
            type="button"
            onClick={search}
            disabled={searching}
            style={{
              padding: "0.55rem 1.05rem",
              background: "var(--ink-2)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: searching ? "default" : "pointer",
              opacity: searching ? 0.6 : 1,
              flexShrink: 0,
              transition: "opacity 0.14s",
            }}
          >
            {searching ? "…" : "Search"}
          </button>
        </div>

        {searchErr && (
          <div style={{ color: "#dc2626", fontSize: "0.77rem", marginTop: "0.32rem" }}>{searchErr}</div>
        )}

        {results.length > 0 && (
          <div style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            marginTop: "0.32rem",
            overflow: "hidden",
            background: "var(--surface)",
            boxShadow: "var(--shadow)",
          }}>
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(r)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "0.52rem 0.75rem",
                  fontSize: "0.815rem", color: "var(--ink-2)",
                  background: "none", border: "none",
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                  cursor: "pointer", transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2, #f8f7f4)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map preview */}
      {mapSrc && (
        <div style={{
          width: "100%", height: 220,
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          border: "1px solid var(--border)",
          marginBottom: "0.75rem",
        }}>
          <iframe
            src={mapSrc}
            width="100%" height="100%"
            style={{ border: "none", display: "block" }}
            title="Location map"
            loading="lazy"
          />
        </div>
      )}

      {/* Lat / Lng */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.65rem" }}>
        <div>
          <label style={labelSt}>Latitude</label>
          <input type="number" step="0.0001" value={value.lat}
            onChange={(e) => setCoord("lat", e.target.value)}
            style={{ ...inp, fontFamily: "var(--font-mono, monospace)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
        <div>
          <label style={labelSt}>Longitude</label>
          <input type="number" step="0.0001" value={value.lng}
            onChange={(e) => setCoord("lng", e.target.value)}
            style={{ ...inp, fontFamily: "var(--font-mono, monospace)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
      </div>

      {/* Address */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <div>
          <label style={labelSt}>Address — EN</label>
          <input value={value.address.en} onChange={(e) => setAddr("en", e.target.value)}
            style={inp}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
        <div>
          <label style={labelSt}>Address — HY</label>
          <input value={value.address.hy} onChange={(e) => setAddr("hy", e.target.value)}
            style={inp}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
      </div>
    </div>
  );
}