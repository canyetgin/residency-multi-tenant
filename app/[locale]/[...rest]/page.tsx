import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.404Page")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function CatchAllPage() {
  notFound()
}
