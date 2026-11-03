import type { AUTH_ACTION_ERROR_CODES, AUTH_OTP_ACTION_ERROR_CODES } from "./constants"

export type AuthActionErrorCode = (typeof AUTH_ACTION_ERROR_CODES)[number]
export type AuthOtpActionErrorCode = (typeof AUTH_OTP_ACTION_ERROR_CODES)[number]

export type AuthActionResponse =
  | {
      success: true
      error?: never
    }
  | {
      success: false
      error: AuthActionErrorCode
    }

export type OTPResendActionResponse =
  | {
      success: true
      expiresAt: number
      error?: never
    }
  | {
      success: false
      error: AuthOtpActionErrorCode
      expiresAt?: never
    }

export type OTPResetSessionActionResponse =
  | {
      success: true
      error?: never
    }
  | {
      success: false
      error: AuthOtpActionErrorCode
    }

export type GetOTPStateQueryResponse = {
  expiresAt: number
  remaining: number
} | null
