import { OTPErrorCode } from "@/lib/otp-cookie"
import type { AUTH_ACTION_ERROR_CODES } from "./constants"

export type AuthActionErrorCode = (typeof AUTH_ACTION_ERROR_CODES)[number]

export type AuthActionResponse = {
  error: AuthActionErrorCode
}

export type OTPResendActionResponse =
  | {
      success: true
      expiresAt: number
    }
  | {
      success: false
      error: OTPErrorCode
    }

export type OTPResetSessionActionResponse = {
  error: OTPErrorCode
}

export type OTPVerifyActionResponse = {
  error: OTPErrorCode
}

export type GetOTPStateQueryResponse = {
  expiresAt: number
  remaining: number
} | null
