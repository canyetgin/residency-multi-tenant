import { z } from "zod"

const EXPECTED_ACTIONS = ["login", "register"] as const

export type ExpectedActionValues = (typeof EXPECTED_ACTIONS)[number]

export const captchaVerifySchema = z.object({
  captchaToken: z.string().min(1, "invalidCaptcha"),
  expectedAction: z.enum(EXPECTED_ACTIONS, "captchaVerificationActionMismatch"),
})

export type CaptchaVerifySchemeValues = z.infer<typeof captchaVerifySchema>

const turnstileSuccessSchema = z.object({
  success: z.literal(true),
  challenge_ts: z.iso.datetime(),
  hostname: z.string(),
  "error-codes": z.array(z.string()),
  action: z.string().optional(),
  cdata: z.string().optional(),
  metadata: z
    .object({
      interactive: z.boolean(),
    })
    .optional(),
})

const turnstileFailureSchema = z.object({
  success: z.literal(false),
  "error-codes": z.array(z.string()),
})

export const turnstileSchema = z.discriminatedUnion("success", [
  turnstileSuccessSchema,
  turnstileFailureSchema,
])

export type TurnstileValues = z.infer<typeof turnstileSchema>
