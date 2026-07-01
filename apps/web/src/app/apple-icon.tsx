import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1512",
        borderRadius: 36,
        border: "4px solid rgba(160, 253, 218, 0.28)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 108,
          height: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "6px solid #a0fdda",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            clipPath: "polygon(12% 30%, 88% 30%, 78% 92%, 22% 92%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 8,
            width: 56,
            height: 24,
            border: "6px solid #a0fdda",
            borderBottom: "none",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 32,
            fontSize: 40,
            fontWeight: 800,
            color: "#f2f7f4",
            letterSpacing: 0,
          }}
        >
          V
        </div>
      </div>
    </div>,
    size,
  );
}
