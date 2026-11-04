import { turnstileAPIResponseSchema } from "@/schemes/trunsitale-api-response.scheme"
import { headers } from "next/headers"
import "server-only"

export const CAPTCHA_ERROR_CODES = [
  "captchaVerificationNotConfigured",
  "captchaVerificationServiceUnavailable",
  "captchaVerificationResponseInvalid",
  "captchaVerificationFailed",
  "captchaVerificationHostnameMismatch",
  "captchaVerificationCouldNotProcess",
] as const

const TRUNSTILE_EXPECTED_TOKEN_ERROR_CODES: readonly string[] = [
  "timeout-or-duplicate",
  "invalid-input-response",
  "bad-request",
  "internal-error",
] as const

export type CaptchaVerifyErrorCode = (typeof CAPTCHA_ERROR_CODES)[number]

export const captchaVerify = async ({ captchaToken }: { captchaToken: string }): Promise<void> => {
  const verifyUrl = process.env.TURNSTILE_VERIFY_URL
  const expectedHostname = process.env.TURNSTILE_HOSTNAME
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!verifyUrl || !expectedHostname || !secret)
    throw new Error("captchaVerificationNotConfigured")

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
      response: captchaToken,
      ...(remoteip && { remoteip }),
    }),
  })

  if (!captchaResponse.ok) {
    throw new Error("captchaVerificationServiceUnavailable")
  }

  const captchaResponseData = await captchaResponse.json()

  const validation = turnstileAPIResponseSchema.safeParse(captchaResponseData)

  if (!validation.success) {
    throw new Error("captchaVerificationResponseInvalid")
  }

  const validationResult = validation.data

  if (!validationResult.success) {
    const errorCodes = validationResult["error-codes"]
    if (errorCodes.some((code) => TRUNSTILE_EXPECTED_TOKEN_ERROR_CODES.includes(code))) {
      throw new Error("captchaVerificationCouldNotProcess")
    }

    throw new Error("captchaVerificationFailed")
  }
  if (validationResult.hostname !== expectedHostname) {
    throw new Error("captchaVerificationHostnameMismatch")
  }
}
