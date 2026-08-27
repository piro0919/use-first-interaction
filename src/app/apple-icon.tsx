import { ImageResponse } from "next/og";

export const size = { height: 180, width: 180 };

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          border: "8px solid rgba(26, 13, 17, 0.65)",
          borderRadius: 999,
          display: "flex",
          height: 118,
          justifyContent: "center",
          width: 118,
        }}
      >
        <div
          style={{
            background: "#1a0d11",
            borderRadius: 999,
            height: 52,
            width: 52,
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
