import "server-only"

export const AUTH_ERROR_CODES = [
  "invalidRequest",
  "invalidCredentials",
  "otpInvalidCode",
  "captchaInvalidToken",
  "somethingWentWrong",
] as const

export const AUTH_OTP_ERROR_CODES = ["otpResendTooSoon", "somethingWentWrong"] as const

export const AUTH_SESSION_COOKIE_NAME = "session_token"
export const AUTH_OTP_COOKIE_NAME = "auth_otp_expires_at"
export const AUTH_OTP_RESEND_DELAY = 120

export const AUTH_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
} as const
