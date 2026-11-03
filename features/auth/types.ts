import type { CaptchaVerifyErrorCode } from "@/lib/captcha-verify"
import type { AUTH_ERROR_CODES, AUTH_OTP_ERROR_CODES } from "./constants"

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]
export type AuthOtpErrorCode = (typeof AUTH_OTP_ERROR_CODES)[number]

export type AuthActionResponse =
  | {
      success: true
      error?: never
    }
  | {
      success: false
      error: AuthErrorCode | CaptchaVerifyErrorCode
    }

export type OTPResendActionResponse =
  | {
      success: true
      expiresAt: number
      error?: never
    }
  | {
      success: false
      error: AuthOtpErrorCode
      expiresAt?: never
    }

export type OTPResetSessionActionResponse =
  | {
      success: true
      error?: never
    }
  | {
      success: false
      error: AuthOtpErrorCode
    }

export type GetOTPStateQueryResponse = {
  expiresAt: number
  remaining: number
} | null
