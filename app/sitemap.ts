import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/marca", priority: 0.8, changeFrequency: "monthly" as const },
    {
      path: "/marca/constituicao",
      priority: 0.6,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/marca/brand-kit",
      priority: 0.6,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/design-system",
      priority: 0.6,
      changeFrequency: "monthly" as const,
    },
  ];

  return routes.map((route) => ({
    url: `${siteConfig.domain}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
