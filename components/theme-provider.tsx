"use client"

import { ThemeProvider as NextThemesProvider } from "@wrksz/themes/next/extended"
import * as React from "react"

export const ThemeProvider = ({ children }: React.ComponentProps<typeof NextThemesProvider>) => {
  return (
    <NextThemesProvider
      storage="hybrid"
      themeColor={{ light: "#ffffff", dark: "#0a0a0a" }}
      disableTransitionOnChange
      enableSameDocumentSync
      systemThemeMap={{ light: "light", dark: "dark" }}
    >
      {children}
    </NextThemesProvider>
  )
}
