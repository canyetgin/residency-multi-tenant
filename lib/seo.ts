import { Locale, routing } from "@/i18n/routing"
import type { Metadata, MetadataRoute } from "next"
import "server-only"

export const HOME = process.env.HOME_URL
export const LOCALES = routing.locales

type SiteMapImage = NonNullable<MetadataRoute.Sitemap[number]["images"]>[number]
export type SiteMapVideo = NonNullable<MetadataRoute.Sitemap[number]["videos"]>[number]

export const buildLocalizedUrl = (path: `/${string}`): Record<Locale, string> => {
  const normalizedPath = path === "/" ? "" : path.replace(/\/+$/, "")

  return Object.fromEntries(
    LOCALES.map((locale) => [locale, encodeURI(`${HOME}/${locale}${normalizedPath}`)])
  ) as Record<Locale, string>
}

export const buildPageAlternates = (
  locale: Locale,
  path: `/${string}`
): NonNullable<Metadata["alternates"]> => {
  const localizedUrls = buildLocalizedUrl(path)

  return {
    canonical: localizedUrls[locale],
    languages: {
      ...localizedUrls,
      "x-default": localizedUrls[routing.defaultLocale], // for best practise. if the locale wont match w/ user's locale, this will be default.
    },
  }
}

export const buildSitemapEntries = ({
  path,
  lastModified,
  videos,
  images,
}: {
  path: `/${string}`
  lastModified?: Date | string
  videos?: SiteMapVideo[] | SiteMapVideo
  images?: SiteMapImage[] | SiteMapImage
}): MetadataRoute.Sitemap => {
  const localizedUrls = buildLocalizedUrl(path)
  return LOCALES.map((locale) => ({
    url: localizedUrls[locale],
    images: images ? [images].flat() : undefined,
    videos: videos ? [videos].flat() : undefined,
    lastModified,
    //omitted and didnt set frequency, and priority
    //according to google docs 2026: google ignores it bc of people mostly gives inaccurate values
    alternates: {
      languages: {
        ...localizedUrls,
        "x-default": localizedUrls[routing.defaultLocale], // for best practise. if the locale wont match w/ user's locale, this will be default.
      },
    },
  }))
}

// includes all kinda langs. even turkish even arabic and rtl
export const slugify = (text: string): string =>
  text
    .normalize("NFC")
    .toLowerCase()
    .replace(/\u0307/g, "")
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
