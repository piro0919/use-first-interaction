import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#120c0e",
    display: "standalone",
    icons: [
      { purpose: "any", sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "180x180", src: "/apple-icon", type: "image/png" },
    ],
    name: "use-first-interaction",
    orientation: "portrait",
    short_name: "first-interaction",
    start_url: "/",
    theme_color: "#120c0e",
  };
}
