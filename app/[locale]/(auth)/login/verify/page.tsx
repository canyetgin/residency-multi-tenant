import { OTPForm } from "@/components/otp-form"
import { getOtpState, getSession } from "@/features/auth/queries"
import { redirect } from "@/i18n/navigation"
import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.verifyOTPPage")
  return {
    title: t("title"),
    description: t("description"),
  }
}

//content need to be fresh and uncached for security reasons. this ignores the appshell and waits for OTP Cookie.
export const instant = false

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
      href: "/login",
      locale,
    })
  }

  return <OTPForm expiresAt={otpState.expiresAt} initialCountdown={otpState.remaining} />
}
