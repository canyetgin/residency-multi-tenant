"use server"

import {
  loginSchema,
  OTPSchema,
  type loginSchemeValues,
  type OTPSchemeValues,
} from "@/schemes/auth.scheme"
import { cookies } from "next/headers"

const OTP_COOKIE_NAME = "otp_expires_at"
const SESSION_COOKIE_NAME = "session_token"

const RESEND_DELAY = 60

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type AuthError = "invalidRequest" | "invalidCredentials" | "otpInvalidCode"

type ActionResponse =
  | {
      success: true
      error?: never
    }
  | {
      success: false
      error: AuthError
    }

type ResendOtpActionResponse =
  | {
      success: true
      expiresAt: number
      error?: never
    }
  | {
      success: false
      error: "otpResendTooSoon"
      expiresAt?: never
    }

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

async function setOtpCookie(): Promise<number> {
  const cookieStore = await cookies()
  const expiresAt = Date.now() + RESEND_DELAY * 1000
  cookieStore.set(OTP_COOKIE_NAME, String(expiresAt), cookieOptions)

  return expiresAt
}

async function deleteOtpCookie(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.delete(OTP_COOKIE_NAME)
}

export async function loginAction(values: loginSchemeValues): Promise<ActionResponse> {
  const validation = loginSchema.safeParse(values)

  if (!validation.success) {
    return {
      success: false,
      error: "invalidRequest",
    }
  }

  await delay(2000)

  const { email, password } = validation.data
  const isValidCredentials = Boolean(email && password)

  if (!isValidCredentials) {
    return {
      success: false,
      error: "invalidCredentials",
    }
  }

  await setOtpCookie()

  return {
    success: true,
  }
}

export async function resendOtpAction(): Promise<ResendOtpActionResponse> {
  const cookieStore = await cookies()
  const currentOtp = cookieStore.get(OTP_COOKIE_NAME)

  if (currentOtp) {
    const currentExpiresAt = Number(currentOtp.value)

    if (Number.isFinite(currentExpiresAt) && currentExpiresAt > Date.now()) {
      return {
        success: false,
        error: "otpResendTooSoon",
      }
    }
  }

  await delay(2000)
  const expiresAt = await setOtpCookie()

  return {
    success: true,
    expiresAt,
  }
}

export async function verifyOtpAction(values: OTPSchemeValues): Promise<ActionResponse> {
  const validation = OTPSchema.safeParse(values)

  if (!validation.success) {
    return {
      success: false,
      error: "invalidRequest",
    }
  }

  await delay(2000)
  const isValid = validation.data.otp === "123456"

  if (!isValid) {
    return {
      success: false,
      error: "otpInvalidCode",
    }
  }

  const cookieStore = await cookies()
  cookieStore.delete(OTP_COOKIE_NAME)
  cookieStore.set(SESSION_COOKIE_NAME, "valid_user_session_token", cookieOptions)

  return {
    success: true,
  }
}

export async function resetOtpSessionAction(): Promise<ActionResponse> {
  await deleteOtpCookie()
  await delay(2000)

  return {
    success: true,
  }
}
