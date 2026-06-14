import { ImageResponse } from "next/og";

export const alt = "Sriram Karthick K — I build Vani, Zoho's whiteboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f6f4ec",
          padding: "76px 88px",
          fontFamily: "sans-serif",
        }}
      >
        {/* sticky-note monogram */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              background: "#fde68a",
              transform: "rotate(-5deg)",
              boxShadow: "4px 6px 0 rgba(0,0,0,0.12)",
              fontSize: 44,
              fontWeight: 800,
              color: "#27313f",
            }}
          >
            SK
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: 26,
              fontSize: 26,
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            an interactive whiteboard portfolio
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 800,
            color: "#1e293b",
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Sriram Karthick K
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#2563eb",
            fontWeight: 700,
            marginTop: 18,
          }}
        >
          Member of Technical Staff · Zoho
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#475569",
            marginTop: 22,
          }}
        >
          I work on Vani — rendering &amp; collaboration, in C++ / Skia / WASM.
        </div>

        {/* bottom marker rule */}
        <div
          style={{
            display: "flex",
            marginTop: 48,
            width: 360,
            height: 10,
            borderRadius: 6,
            background: "#db2777",
            transform: "rotate(-1deg)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
