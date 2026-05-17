import type { MetadataRoute } from "next";

const base = "https://www.agonatura.nl";

const routes = [
  "",
  "/behandelvisie",
  "/behandelvormen",
  "/locaties",
  "/lelystad",
  "/voor-ouders",
  "/voor-verwijzers",
  "/voor-gemeenten",
  "/over",
  "/team",
  "/aanmelden",
  "/privacyverklaring",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
