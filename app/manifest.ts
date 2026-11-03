import { routing } from "@/i18n/routing"
import { MetadataRoute } from "next"
import { getTranslations } from "next-intl/server"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({
    locale: routing.defaultLocale,
    namespace: "metadata",
  })

  return {
    name: t("title"),
    start_url: "/",
    theme_color: "#101E33",
  }
}
