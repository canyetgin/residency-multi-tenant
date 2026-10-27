"use client"

import { useHydrated, useTheme } from "@wrksz/themes/client"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "./ui/button"

export function ThemeSwitch() {
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
      {isLight ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  )
}
