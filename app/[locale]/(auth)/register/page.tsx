import { getOtpState, getSession } from "@/features/queries/auth"
import { redirect } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"

//content need to be fresh and uncached for security reasons. this ignores the appshell and waits for OTP Cookie.
export const instant = false

export default async function RegisterPage() {
  const locale = await getLocale()

  const hasSession = await getSession()
  if (hasSession) {
    return redirect({ href: "/dashboard", locale })
  }

  const otpState = await getOtpState()

  if (otpState) {
    return redirect({
      href: "/login/verify",
      locale,
    })
  }

  return <p>Register</p>
}
