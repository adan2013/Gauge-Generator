import { ImageResponse } from "next/og";

export const alt = "Gauge Generator — free, open-source gauge design in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#f6f7f9",
        color: "#20242b",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "flex-start",
          background: "#ffffff",
          border: "1px solid #d8dce2",
          borderRadius: "30px",
          boxShadow: "0 26px 70px rgba(32,36,43,0.10)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "58px 62px",
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", fontSize: 28, fontWeight: 700 }}>
          <div
            style={{
              alignItems: "center",
              background: "#c62828",
              borderRadius: "14px",
              color: "#ffffff",
              display: "flex",
              height: 58,
              justifyContent: "center",
              marginRight: 18,
              width: 58,
            }}
          >
            GG
          </div>
          Gauge Generator
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#c62828", fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
            OPEN SOURCE · LOCAL FIRST · FREE
          </div>
          <div
            style={{
              fontSize: 66,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.04,
              marginTop: 22,
              maxWidth: 920,
            }}
          >
            Design precise gauges. Keep every file yours.
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
