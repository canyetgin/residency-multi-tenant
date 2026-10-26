"use client"

import { useHydrated, useTheme } from "@wrksz/themes/client"

const options = ["system", "light", "dark"] as const

export function ThemeSwitch() {
  const { theme, setTheme, forcedTheme } = useTheme<"light" | "dark">()
  const hydrated = useHydrated()

  return (
    <select
      aria-label="Theme"
      disabled={Boolean(forcedTheme)}
      value={hydrated ? (theme ?? options[0]) : options[0]}
      onChange={(event) => setTheme(event.target.value as (typeof options)[number])}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
