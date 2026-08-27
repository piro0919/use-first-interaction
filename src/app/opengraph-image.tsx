import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "use-first-interaction";

export const size = { height: 630, width: 1200 };

export const contentType = "image/png";

const TITLE = "Load it when";
const TITLE_SECOND = "they arrive.";

export default async function Image() {
  /* The same Bricolage Grotesque the site uses for headings, cut down to Latin.
     Change the copy and rebuild it per assets/README.md. */
  const font = await readFile(
    join(process.cwd(), "assets/BricolageGrotesque-700-subset.ttf"),
  );

  return new ImageResponse(
    <div
      style={{
        background: "#120c0e",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "0 80px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#fb7185",
          display: "flex",
          fontSize: 26,
          letterSpacing: 4,
        }}
      >
        USE-FIRST-INTERACTION
      </div>
      <div style={{ display: "flex", fontSize: 72, marginTop: 24 }}>
        {TITLE}
      </div>
      <div style={{ color: "#a1a1aa", display: "flex", fontSize: 72 }}>
        {TITLE_SECOND}
      </div>

      {/* The visit, drawn along its own timeline: nothing fetched until the
          moment someone touches the page. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 62,
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex" }}>
          <div
            style={{
              background: "#3f2b31",
              borderRadius: 999,
              display: "flex",
              height: 10,
              width: 620,
            }}
          />
          <div
            style={{
              background: "#fb7185",
              borderRadius: 999,
              display: "flex",
              height: 30,
              marginLeft: -4,
              width: 30,
            }}
          />
          <div
            style={{
              background: "#fb7185",
              borderRadius: 999,
              display: "flex",
              height: 10,
              width: 320,
            }}
          />
        </div>
        <div
          style={{
            color: "#71717a",
            display: "flex",
            fontSize: 24,
            marginTop: 22,
          }}
        >
          <span style={{ display: "flex", width: 620 }}>
            nothing fetched yet
          </span>
          <span style={{ color: "#fb7185", display: "flex" }}>
            first interaction — now load it
          </span>
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
