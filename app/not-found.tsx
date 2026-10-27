"use client"

import { cn } from "@/lib/utils"
import { Geist_Mono, Instrument_Sans } from "next/font/google"

const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", instrumentSans.variable)}
    >
      <head>
        <title>Residency | 404 - Page Not Found</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </head>
      <body>
        <p>404 - Page Not Found</p>
      </body>
    </html>
  )
}
