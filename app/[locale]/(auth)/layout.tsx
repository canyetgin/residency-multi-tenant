import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex w-full flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
        <div className="mt-6 flex w-full flex-nowrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  )
}
