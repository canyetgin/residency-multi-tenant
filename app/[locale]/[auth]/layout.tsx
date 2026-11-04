import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-8 max-w-sm">
        {children}
        <div className="mt-6 flex w-full flex-nowrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </main>
  )
}
