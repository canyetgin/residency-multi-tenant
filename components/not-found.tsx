import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"

export default async function NotFoundPage() {
  const t = await getTranslations("requests.notFound")

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="mt-4 text-lg">{t("description")}</p>
      <Link href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        {t("buttonText")}
      </Link>
    </div>
  )
}
