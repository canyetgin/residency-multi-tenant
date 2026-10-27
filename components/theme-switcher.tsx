"use client"

import { useHydrated, useTheme } from "@wrksz/themes/client"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "./ui/button"

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme<"light" | "dark">()
  const t = useTranslations("themeSwitcher")
  const hydrated = useHydrated()
  const isLight = resolvedTheme === "light"

  return (
    <Button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={hydrated ? (isLight ? t("toDark") : t("toLight")) : undefined}
      variant="outline"
    >
      <Sun className="hidden h-[1.2rem] w-[1.2rem] dark:block" />
      <Moon className="block h-[1.2rem] w-[1.2rem] dark:hidden" />
    </Button>
  )
}
