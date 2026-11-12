"use server"

import { captchaVerify } from "@/lib/captcha-verify"
import { OTP_ERROR_CODES, otpDeleteCookie, otpSetCookie } from "@/lib/otp-cookie"
import { resolveTypedError } from "@/lib/resolve-typed-errors"
import { safeRedirect } from "@/lib/safe-redirect"
import { delay } from "@/lib/utils"
import {
  loginSchema,
  OTPSchema,
  type loginSchemeValues,
  type OTPSchemeValues,
} from "@/schemes/auth.scheme"
import { cookies } from "next/headers"
import { redirect, RedirectType } from "next/navigation"
import {
  AUTH_ACTION_ERROR_CODES,
  AUTH_OTP_COOKIE_NAME,
  AUTH_OTP_RESEND_DELAY,
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_COOKIE_OPTIONS,
} from "./constants"
import {
  AuthActionResponse,
  OTPResendActionResponse,
  OTPResetSessionActionResponse,
  OTPVerifyActionResponse,
} from "./types"

//TODO - remove all delay functions when will implement better auth,
// it's only for simulating network latency during development

export async function loginAction(
  values: loginSchemeValues,
  next?: string | null
): Promise<AuthActionResponse> {
  try {
    const validation = loginSchema.safeParse(values)

    if (!validation.success) {
      throw new Error("invalidRequest")
    }
    const { email, password, captchaToken } = validation.data

    await captchaVerify({ captchaToken })

    await delay(2000)

    const isValidCredentials = Boolean(email === "can@can.com" && password)

    if (!isValidCredentials) {
      throw new Error("loginInvalidCredentials")
    }

    await otpSetCookie({ resendDelay: AUTH_OTP_RESEND_DELAY, cookieName: AUTH_OTP_COOKIE_NAME })
  } catch (error: unknown) {
    return {
      error: resolveTypedError({
        error,
        allowedErrors: AUTH_ACTION_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }

  if (next) {
    const redirectTo = safeRedirect(next)
    const params = new URLSearchParams({ next: redirectTo })
    redirect(`/auth/verify?${params}`, RedirectType.replace)
  }

  return redirect("/auth/verify", RedirectType.replace)
}

export async function otpResendAction(): Promise<OTPResendActionResponse> {
  try {
    const cookieStore = await cookies()
    const currentOtp = cookieStore.get(AUTH_OTP_COOKIE_NAME)

    if (!currentOtp) throw new Error("invalidRequest")

    const currentExpiresAt = Number(currentOtp.value)

    if (!Number.isFinite(currentExpiresAt)) {
      throw new Error("invalidRequest")
    }

    if (currentExpiresAt > Date.now()) {
      throw new Error("otpResendTooSoon")
    }

    await delay(2000)

    const expiresAt = await otpSetCookie({
      resendDelay: AUTH_OTP_RESEND_DELAY,
      cookieName: AUTH_OTP_COOKIE_NAME,
    })

    return {
      success: true,
      expiresAt,
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: resolveTypedError({
        error,
        allowedErrors: OTP_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }
}

export async function otpVerifyAction(
  values: OTPSchemeValues,
  next?: string | null
): Promise<OTPVerifyActionResponse> {
  try {
    const validation = OTPSchema.safeParse(values)

    if (!validation.success) throw new Error("invalidRequest")

    const cookieStore = await cookies()
    const currentOtp = cookieStore.get(AUTH_OTP_COOKIE_NAME)

    if (!currentOtp) {
      throw new Error("invalidRequest")
    }

    const expiresAt = Number(currentOtp.value)

    if (!Number.isFinite(expiresAt)) {
      throw new Error("invalidRequest")
    }

    if (expiresAt <= Date.now()) {
      throw new Error("otpExpired")
    }

    await delay(2000)

    const isValid = validation.data.otp === "123456"

    if (!isValid) throw new Error("otpInvalidCode")

    await otpDeleteCookie({ cookieName: AUTH_OTP_COOKIE_NAME })

    cookieStore.set(
      AUTH_SESSION_COOKIE_NAME,
      "valid_user_session_token",
      AUTH_SESSION_COOKIE_OPTIONS
    )
  } catch (error: unknown) {
    return {
      error: resolveTypedError({
        error,
        allowedErrors: OTP_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }
  if (next) {
    return redirect(safeRedirect(next), RedirectType.replace)
  }

  return redirect("/auth/verify", RedirectType.replace)
}

export async function otpResetSessionAction(): Promise<OTPResetSessionActionResponse> {
  try {
    await otpDeleteCookie({ cookieName: AUTH_OTP_COOKIE_NAME })
    await delay(2000)
  } catch (error: unknown) {
    return {
      error: resolveTypedError({
        error,
        allowedErrors: OTP_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }
  return redirect("/auth/login", RedirectType.replace)
}
