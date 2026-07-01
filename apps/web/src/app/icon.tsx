import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1512",
        border: "2px solid rgba(160, 253, 218, 0.28)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2.5px solid #a0fdda",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            clipPath: "polygon(12% 30%, 88% 30%, 78% 92%, 22% 92%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 3,
            width: 20,
            height: 10,
            border: "2.5px solid #a0fdda",
            borderBottom: "none",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 14,
            fontSize: 14,
            fontWeight: 700,
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
