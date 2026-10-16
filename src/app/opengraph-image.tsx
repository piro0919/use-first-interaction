import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "use-first-interaction";

export const size = { height: 630, width: 1200 };

export const contentType = "image/png";

const TITLE = "use-first-interaction";
const DESCRIPTION =
  "A React hook that reports the first time a visitor touches the page.";

export default async function Image() {
  /* The same Bricolage Grotesque the site uses for headings, cut down to Latin.
     Change the copy and rebuild it per assets/README.md. */
  const font = await readFile(
    join(process.cwd(), "assets/BricolageGrotesque-700-subset.ttf"),
  );

  /* Same layout as the other package cards on kkweb.io: name, one line and
     the domain on the left, what the package does on the right. */
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0b0b0f",
        color: "#ffffff",
        display: "flex",
        height: "100%",
        padding: "0 80px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 600,
        }}
      >
        <div style={{ display: "flex", fontSize: 54, letterSpacing: -1 }}>
          {TITLE}
        </div>
        <div
          style={{
            color: "#a1a1aa",
            display: "flex",
            fontSize: 30,
            lineHeight: 1.4,
            marginTop: 28,
          }}
        >
          {DESCRIPTION}
        </div>
        <div
          style={{
            color: "#71717a",
            display: "flex",
            fontSize: 26,
            marginTop: 48,
          }}
        >
          kkweb.io
        </div>
      </div>

      {/* The visit, drawn along its own timeline: nothing fetched until the
          moment someone touches the page. */}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            background: "#15151c",
            border: "1px solid #26262f",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            padding: 28,
          }}
        >
          <div style={{ alignItems: "center", display: "flex" }}>
            <div
              style={{
                background: "#3f2b31",
                borderRadius: 999,
                display: "flex",
                height: 10,
                width: 210,
              }}
            />
            <div
              style={{
                background: "#fb7185",
                borderRadius: 999,
                display: "flex",
                height: 28,
                marginLeft: -4,
                width: 28,
              }}
            />
            <div
              style={{
                background: "#fb7185",
                borderRadius: 999,
                display: "flex",
                height: 10,
                width: 120,
              }}
            />
          </div>
          <div
            style={{
              color: "#71717a",
              display: "flex",
              fontSize: 20,
              marginTop: 20,
            }}
          >
            <span style={{ display: "flex", width: 210 }}>
              nothing fetched yet
            </span>
            <span style={{ color: "#fb7185", display: "flex" }}>
              now load it
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          data: font,
          name: "Bricolage Grotesque",
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
