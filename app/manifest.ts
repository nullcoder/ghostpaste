import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GhostPaste - Zero-Knowledge Encrypted Code Sharing",
    short_name: "GhostPaste",
    description:
      "Share code snippets securely with client-side encryption. Your code, your privacy.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: ["developer", "utilities", "productivity"],
  };
}
