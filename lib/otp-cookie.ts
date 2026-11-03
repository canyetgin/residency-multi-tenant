import { cookies } from "next/headers"
import "server-only"

export const OTP_DEFAULT_COOKIE_NAME = "otp_expires_at"
export const OTP_DEFAULT_RESEND_DELAY = 60

type OTPSetCookieParamsType = {
  resendDelay?: number
  cookieName?: string
}

type OTPDeleteCookieParamsType = {
  cookieName?: string
}

const OTP_DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function otpSetCookie({
  resendDelay = OTP_DEFAULT_RESEND_DELAY,
  cookieName = OTP_DEFAULT_COOKIE_NAME,
}: OTPSetCookieParamsType = {}): Promise<number> {
  const cookieStore = await cookies()
  const expiresAt = Date.now() + resendDelay * 1000
  cookieStore.set(cookieName, String(expiresAt), OTP_DEFAULT_COOKIE_OPTIONS)

  return expiresAt
}

export async function otpDeleteCookie({
  cookieName = OTP_DEFAULT_COOKIE_NAME,
}: OTPDeleteCookieParamsType = {}): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.delete(cookieName)
}
