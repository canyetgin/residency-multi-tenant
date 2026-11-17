import {
  captchaVerifyInputSchema,
  turnstileResponseSchema,
  type CaptchaVerifyInput,
} from "@/schemas/turnstile.schema"
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

const TURNSTILE_EXPECTED_TOKEN_ERROR_CODES = [
  "timeout-or-duplicate",
  "invalid-input-response",
  "bad-request",
] as const

export type CaptchaVerifyErrorCode = (typeof CAPTCHA_ERROR_CODES)[number]

export const verifyCaptcha = async ({
  captchaToken,
  expectedAction,
}: CaptchaVerifyInput): Promise<void> => {
  const verifyUrl = process.env.TURNSTILE_VERIFY_URL
  const expectedHostname = process.env.TURNSTILE_HOSTNAME
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!verifyUrl || !expectedHostname || !secret) {
    throw new Error("captchaVerificationNotConfigured")
  }

  const parsedInput = captchaVerifyInputSchema.safeParse({ captchaToken, expectedAction })

  if (!parsedInput.success) {
    throw new Error("captchaVerificationCouldNotProcess")
  }

  const headerStore = await headers()

  const remoteip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    undefined // in dev environment, the remote IP might not be available

  const captchaResponse = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      response: parsedInput.data.captchaToken,
      action: parsedInput.data.expectedAction,
      ...(remoteip && { remoteip }),
    }),
  })

  if (!captchaResponse.ok) {
    throw new Error("captchaVerificationServiceUnavailable")
  }

  const captchaResponseData = await captchaResponse.json()

  const parsedResponse = turnstileResponseSchema.safeParse(captchaResponseData)

  if (!parsedResponse.success) {
    throw new Error("captchaVerificationResponseInvalid")
  }

  const verification = parsedResponse.data

  if (!verification.success) {
    const errorCodes = verification["error-codes"]
    if (
      errorCodes.some((code) =>
        (TURNSTILE_EXPECTED_TOKEN_ERROR_CODES as readonly string[]).includes(code)
      )
    ) {
      throw new Error("captchaVerificationCouldNotProcess")
    }
    // for "internal-error" and others
    throw new Error("captchaVerificationFailedOrUnavailable")
  }

  if (verification.action !== parsedInput.data.expectedAction) {
    throw new Error("captchaVerificationActionMismatch")
  }

  if (verification.hostname !== expectedHostname) {
    throw new Error("captchaVerificationHostnameMismatch")
  }
}
