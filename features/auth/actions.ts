"use server"

import { captchaVerify } from "@/lib/captcha-verify"
import { otpDeleteCookie, otpSetCookie } from "@/lib/otp-cookie"
import { resolveTypedError } from "@/lib/resolve-typed-errors"
import {
  loginSchema,
  OTPSchema,
  type loginSchemeValues,
  type OTPSchemeValues,
} from "@/schemes/auth.scheme"
import { cookies } from "next/headers"
import {
  AUTH_ERROR_CODES,
  AUTH_OTP_COOKIE_NAME,
  AUTH_OTP_ERROR_CODES,
  AUTH_OTP_RESEND_DELAY,
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_COOKIE_OPTIONS,
} from "./constants"
import { AuthActionResponse, OTPResendActionResponse, OTPResetSessionActionResponse } from "./types"

//TODO - remove this delay function when will implement better auth,
// it's only for simulating network latency during development
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function loginAction(values: loginSchemeValues): Promise<AuthActionResponse> {
  try {
    const validation = loginSchema.safeParse(values)

    if (!validation.success) {
      throw new Error("invalidRequest")
    }
    const { email, password, captchaToken } = validation.data

    await captchaVerify({ captchaToken })

    await delay(2000)

    const isValidCredentials = Boolean(email && password)

    if (!isValidCredentials) {
      throw new Error("invalidCredentials")
    }

    await otpSetCookie({ resendDelay: AUTH_OTP_RESEND_DELAY, cookieName: AUTH_OTP_COOKIE_NAME })

    return {
      success: true,
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: resolveTypedError({
        error,
        allowedErrors: AUTH_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }
}

export async function otpResendAction(): Promise<OTPResendActionResponse> {
  try {
    const cookieStore = await cookies()
    const currentOtp = cookieStore.get(AUTH_OTP_COOKIE_NAME)

    if (currentOtp) {
      const currentExpiresAt = Number(currentOtp.value)

      if (Number.isFinite(currentExpiresAt) && currentExpiresAt > Date.now())
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
        allowedErrors: AUTH_OTP_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }
}

export async function otpVerifyAction(values: OTPSchemeValues): Promise<AuthActionResponse> {
  try {
    const validation = OTPSchema.safeParse(values)

    if (!validation.success) throw new Error("invalidRequest")

    await delay(2000)

    const isValid = validation.data.otp === "123456"

    if (!isValid) throw new Error("otpInvalidCode")

    const cookieStore = await cookies()
    await otpDeleteCookie({ cookieName: AUTH_OTP_COOKIE_NAME })

    cookieStore.set(
      AUTH_SESSION_COOKIE_NAME,
      "valid_user_session_token",
      AUTH_SESSION_COOKIE_OPTIONS
    )

    return {
      success: true,
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: resolveTypedError({
        error,
        allowedErrors: AUTH_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }
}

export async function otpResetSessionAction(): Promise<OTPResetSessionActionResponse> {
  try {
    await otpDeleteCookie({ cookieName: AUTH_OTP_COOKIE_NAME })
    await delay(2000)

    return {
      success: true,
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: resolveTypedError({
        error,
        allowedErrors: AUTH_OTP_ERROR_CODES,
        fallback: "somethingWentWrong",
      }),
    }
  }
}
