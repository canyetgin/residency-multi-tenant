import "server-only"

import { cookies } from "next/headers"
import { AUTH_OTP_COOKIE_NAME, AUTH_SESSION_COOKIE_NAME } from "./constants"
import { GetOTPStateQueryResponse } from "./types"

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(AUTH_SESSION_COOKIE_NAME)

  return Boolean(sessionCookie?.value)
}

export async function getOtpState(): Promise<GetOTPStateQueryResponse> {
  const cookieStore = await cookies()
  const expiresAtCookie = cookieStore.get(AUTH_OTP_COOKIE_NAME)

  if (!expiresAtCookie) {
    return null
  }

  const expiresAt = Number(expiresAtCookie.value)

  if (!Number.isFinite(expiresAt)) {
    return null
  }

  const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))

  return {
    expiresAt,
    remaining,
  }
}
