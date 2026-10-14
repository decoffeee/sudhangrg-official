import { ImageResponse } from "next/og";
import { site } from "@/data/content";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(180deg, #111b31 0%, #010307 100%)",
          color: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
          <span>SUDHAN GURUNG / OFFICIAL PORTFOLIO</span>
          <span style={{ opacity: 0.5 }}>HOME MINISTER · NEPAL</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 236, fontWeight: 900, color: "#e64446", letterSpacing: -14, lineHeight: 0.9 }}>SUDHAN</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#e64446", letterSpacing: -2 }}>HOME MINISTER NEPAL</div>
            <div style={{ fontSize: 24, opacity: 0.7 }}>Member of Parliament · Gorkha</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
