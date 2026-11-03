import { z } from "zod"

const turnstileSuccessSchema = z.object({
  success: z.literal(true),
  challenge_ts: z.iso.datetime(),
  hostname: z.string(),
  "error-codes": z.array(z.string()),
  action: z.string().optional(),
  cdata: z.string().optional(),
  metadata: z
    .object({
      ephemeral_id: z.string(),
    })
    .optional(),
})

const turnstileFailureSchema = z.object({
  success: z.literal(false),
  "error-codes": z.array(z.string()),
})

export const turnstileAPIResponseSchema = z.discriminatedUnion("success", [
  turnstileSuccessSchema,
  turnstileFailureSchema,
])

export type TurnstileAPIResponseValues = z.infer<typeof turnstileAPIResponseSchema>
