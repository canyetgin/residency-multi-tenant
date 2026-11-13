import { OTPForm } from "@/features/auth/components.ts/otp-form"
import { getOtpState, getSession } from "@/features/auth/queries"
import { redirect } from "@/i18n/navigation"
import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

//content need to be fresh and uncached for security reasons and biggest reason is we dont want show a suspense fallback.
// this ignores the appshell and waits for OTP Cookie.
export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.verifyOTPPage")
  return {
    title: t("title"),
    description: t("description"),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

export default async function OTPPage() {
  const locale = await getLocale()

  const hasSession = await getSession()

  if (hasSession) {
    return redirect({
      href: "/dashboard",
      locale,
    })
  }

  const otpState = await getOtpState()

  if (!otpState) {
    return redirect({
      href: "/auth/login",
      locale,
    })
  }

  return <OTPForm expiresAt={otpState.expiresAt} initialCountdown={otpState.remaining} />
}
