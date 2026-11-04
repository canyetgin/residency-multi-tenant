"use client" // needed to use as fully client - workaround for global not found - I saw this in official next-intl github repo example
import { NotFoundLayout } from "@/components/not-found-layout"
import { cn } from "@/lib/utils"
import ENTranslations from "@/translations/en.json"
import { ThemeProvider } from "@wrksz/themes"
import { NextIntlClientProvider } from "next-intl"
import { Geist_Mono, Instrument_Sans } from "next/font/google"
import "./globals.css"

const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

//need to provide fallback messages and pass it as messages with the locale prop to NextIntlClientProvider,
// since in root level NextIntlClientProvider is not locale aware
const fallbackMessages = {
  pages: {
    "404Page": ENTranslations.pages["404Page"],
  },
  general: {
    goBack: "Go Back",
  },
}

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", instrumentSans.variable)}
    >
      <head>
        <title>{`${fallbackMessages.pages["404Page"].title} | Residency`}</title>
        <meta name="description" content={fallbackMessages.pages["404Page"].description} />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <NextIntlClientProvider locale="en" messages={fallbackMessages}>
          <ThemeProvider>
            <NotFoundLayout />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
