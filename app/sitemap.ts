import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ghostpaste.dev";

  // Static pages that should be indexed
  const staticPages = [
    "",
    "/create",
    "/help",
    "/examples",
    "/security",
    "/privacy",
    "/terms",
    "/about",
  ];

  const sitemap: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? "daily" : "weekly",
    priority: page === "" ? 1 : page === "/create" ? 0.9 : 0.8,
  }));

  return sitemap;
}
