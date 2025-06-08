import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/g/", // Don't index individual gists for privacy
        ],
      },
    ],
    sitemap: "https://ghostpaste.dev/sitemap.xml",
  };
}
