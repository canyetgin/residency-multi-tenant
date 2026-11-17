import {
  captchaVerifySchema,
  turnstileSchema,
  type CaptchaVerifySchemeValues,
} from "@/schemes/turnstile.scheme"
import { headers } from "next/headers"
import "server-only"

export const CAPTCHA_ERROR_CODES = [
  "captchaVerificationNotConfigured",
  "captchaVerificationServiceUnavailable",
  "captchaVerificationResponseInvalid",
  "captchaVerificationFailedOrUnavailable",
  "captchaVerificationHostnameMismatch",
  "captchaVerificationCouldNotProcess",
  "captchaVerificationActionMismatch",
] as const

const TRUNSTILE_EXPECTED_TOKEN_ERROR_CODES: readonly string[] = [
  "timeout-or-duplicate",
  "invalid-input-response",
  "bad-request",
] as const

export type CaptchaVerifyErrorCode = (typeof CAPTCHA_ERROR_CODES)[number]

export const captchaVerify = async ({
  captchaToken,
  expectedAction,
}: CaptchaVerifySchemeValues): Promise<void> => {
  const verifyUrl = process.env.TURNSTILE_VERIFY_URL
  const expectedHostname = process.env.TURNSTILE_HOSTNAME
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!verifyUrl || !expectedHostname || !secret)
    throw new Error("captchaVerificationNotConfigured")

  const propsValidaiton = captchaVerifySchema.safeParse({ captchaToken, expectedAction })

  if (!propsValidaiton.success) {
    throw new Error("captchaVerificationResponseInvalid")
  }

  const propsValidaitonResult = propsValidaiton.data

  const headerStore = await headers()

  const remoteip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    undefined // in dev envorionment, the remote IP might not be available

  const captchaResponse = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: secret,
      response: propsValidaitonResult.captchaToken,
      action: propsValidaitonResult.expectedAction,
      ...(remoteip && { remoteip }),
    }),
  })

  if (!captchaResponse.ok) {
    throw new Error("captchaVerificationServiceUnavailable")
  }

  const captchaResponseData = await captchaResponse.json()

  const responseValidation = turnstileSchema.safeParse(captchaResponseData)

  if (!responseValidation.success) {
    throw new Error("captchaVerificationResponseInvalid")
  }

  const responseValidationResult = responseValidation.data

  if (!responseValidationResult.success) {
    const errorCodes = responseValidationResult["error-codes"]
    if (errorCodes.some((code) => TRUNSTILE_EXPECTED_TOKEN_ERROR_CODES.includes(code))) {
      throw new Error("captchaVerificationCouldNotProcess")
    }
    //for "internal-error" and others
    throw new Error("captchaVerificationFailedOrUnavailable")
  }
  if (responseValidationResult.action !== expectedAction) {
    throw new Error("captchaVerificationActionMismatch")
  }
  if (responseValidationResult.hostname !== expectedHostname) {
    throw new Error("captchaVerificationHostnameMismatch")
  }
}
