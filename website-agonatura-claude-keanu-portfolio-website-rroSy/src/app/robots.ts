import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/aanmelden/start", "/api/"],
      },
    ],
    sitemap: "https://www.agonatura.nl/sitemap.xml",
    host: "https://www.agonatura.nl",
  };
}
