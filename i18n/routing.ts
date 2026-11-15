import { defineRouting } from "next-intl/routing"

const locales = ["en", "tr"] as const

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // disabled default alternate headers because lib/seo.ts (we imort it in sitemap and pages) handles everything consistently:
  // 1. next-intl only sets hreflang in http headers, it never generates canonical tags
  // 2. middleware headers only run on page visits and don't populate sitemap.xml
  // 3. it blindly injects hreflang on noindex routes and missing translations before db checks
  // 4. it relies on incoming request host headers instead of guaranteeing our exact production domain
  alternateLinks: false,
})

export type Locale = (typeof routing.locales)[number]
