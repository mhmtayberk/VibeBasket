import { ImageResponse } from "next/og";

export const alt = "VibeBasket";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0f1512",
        color: "#f4f7f5",
        padding: "64px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          color: "#92f8d3",
          fontSize: 24,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 9999,
            background: "#92f8d3",
            display: "flex",
          }}
        />
        Trusted AI setup bundles
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: 940 }}>
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.92 }}>
          VibeBasket
        </div>
        <div
          style={{
            fontSize: 36,
            lineHeight: 1.35,
            color: "#c2d0c9",
            maxWidth: 920,
          }}
        >
          Bundle trusted MCP servers, skills, and project rules into one shareable install flow.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(146, 248, 211, 0.2)",
          paddingTop: 24,
          color: "#92f8d3",
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex" }}>vibebasket.dev</div>
        <div style={{ display: "flex", color: "#c2d0c9" }}>24 supported targets</div>
      </div>
    </div>,
    size,
  );
}
