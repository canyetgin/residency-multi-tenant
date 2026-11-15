import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { Locale } from "@/i18n/routing"
import { buildPageAlternates } from "@/lib/seo"
import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

// Static page example (no params prop needed for locale)
export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations("metadata")

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildPageAlternates(locale, "/"),
  }
}

export default async function Page() {
  await getLocale()
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
      <Link href="/to-non-existing-page">To Non Existing Page</Link>
      <ThemeSwitcher />
      <LocaleSwitcher />
    </div>
  )
}
