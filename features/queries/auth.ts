import "server-only"

import { cookies } from "next/headers"
import { connection } from "next/server"

const OTP_COOKIE_NAME = "otp_expires_at"
const SESSION_COOKIE_NAME = "session_token"

export async function getSession(): Promise<boolean> {
  await connection()

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  return Boolean(sessionCookie?.value)
}

type QueryResponse = {
  expiresAt: number
  remaining: number
} | null

export async function getOtpState(): Promise<QueryResponse> {
  await connection()

  const cookieStore = await cookies()
  const expiresAtCookie = cookieStore.get(OTP_COOKIE_NAME)

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
