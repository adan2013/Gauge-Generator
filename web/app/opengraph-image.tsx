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
          <svg
            aria-hidden="true"
            height="82"
            style={{ marginRight: 18 }}
            viewBox="0 0 512 512"
            width="82"
          >
            <defs>
              <clipPath id="og-letter-outline">
                <circle cx="256" cy="256" r="196" />
              </clipPath>
            </defs>
            <g fill="none" stroke="#20242c" strokeLinecap="butt" strokeWidth="56">
              <path d="M 374.793939 137.206061 A 168 168 0 1 0 424 256" />
              <path clipPath="url(#og-letter-outline)" d="M 256 256 H 452" />
            </g>
            <path
              d="M 394.592929 117.407071 L 278.424345 272.767491 A 28 28 0 1 1 239.232509 233.575655 Z"
              fill="#d12525"
            />
          </svg>
          Gauge Generator
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#c62828", fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
            OPEN SOURCE · LOCAL FIRST · FREE
          </div>
          <div
            style={{
              fontSize: 58,
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
