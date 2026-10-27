"use client"

import { FlagIcon } from "@/components/icons/flag-icon"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useTransition } from "react"

export function LocaleSwitcher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const params = useParams()

  const currentLocale = useLocale() as Locale
  const t = useTranslations("languageSwitcher")

  function onSelectChange(value: Locale | null) {
    if (!value) return

    startTransition(() => {
      router.replace(
        // @ts-expect-error -- pathnames parameter type safety bypass
        { pathname, params },
        { locale: value }
      )
    })
  }

  return (
    <Select value={currentLocale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-full max-w-36" aria-label={t("label")}>
        <span className="flex items-center gap-1.5 pointer-events-none">
          <FlagIcon country={currentLocale} />
          <SelectValue>{t(currentLocale)}</SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("label")}</SelectLabel>
          {routing.locales.map((locale) => (
            <SelectItem key={locale} value={locale} lang={locale} className="cursor-pointer">
              <div className="flex items-center gap-1.5 pointer-events-none">
                <FlagIcon country={locale} />
                <span>{t(locale)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
