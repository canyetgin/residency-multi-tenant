import { z } from "zod"

const TURNSTILE_EXPECTED_ACTIONS = ["login", "register"] as const

export type TurnstileExpectedAction = (typeof TURNSTILE_EXPECTED_ACTIONS)[number]

export const captchaVerifyInputSchema = z.object({
  captchaToken: z.string().min(1, "invalidCaptcha"),
  expectedAction: z.enum(TURNSTILE_EXPECTED_ACTIONS, "captchaVerificationActionMismatch"),
})

export type CaptchaVerifyInput = z.infer<typeof captchaVerifyInputSchema>

const turnstileSuccessResponseSchema = z.object({
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

const turnstileFailureResponseSchema = z.object({
  success: z.literal(false),
  "error-codes": z.array(z.string()),
})

export const turnstileResponseSchema = z.discriminatedUnion("success", [
  turnstileSuccessResponseSchema,
  turnstileFailureResponseSchema,
])

export type TurnstileResponse = z.infer<typeof turnstileResponseSchema>
