import { LoginForm } from "@/features/auth/components.ts/login-form"
import { getOtpState, getSession } from "@/features/auth/queries"
import { redirect } from "@/i18n/navigation"
import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

//content need to be fresh and uncached for security reasons and biggest reason is we dont want show a suspense fallback.
// this ignores the appshell and waits for OTP Cookie.
export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.loginPage")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function LoginPage() {
  const locale = await getLocale()

  const hasSession = await getSession()
  if (hasSession) {
    return redirect({ href: "/dashboard", locale })
  }

  const otpState = await getOtpState()

  if (otpState) {
    return redirect({
      href: "/auth/verify",
      locale,
    })
  }

  return <LoginForm />
}
