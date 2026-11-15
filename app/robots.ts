import { HOME } from "@/lib/seo"
import type { MetadataRoute } from "next"

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/auth/"] }],
    sitemap: [`${HOME}/sitemap.xml`],
  }
}
