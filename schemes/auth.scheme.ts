import { isValidPhoneNumber } from "react-phone-number-input/input"
import { z } from "zod"
import { captchaVerifyInputSchema } from "./turnstile.scheme"

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_RULES = {
  uppercase: /\p{Lu}/u,
  number: /\p{Nd}/u,
  specialCharacter: /[\p{P}\p{S}]/u,
  minLength: PASSWORD_MIN_LENGTH,
  maxLength: PASSWORD_MAX_LENGTH,
} as const

export const OTP_DIGITS_ONLY_RULE = /^\d+$/

const authBaseFields = {
  email: z.email("invalidEmail"),
  captchaToken: captchaVerifyInputSchema.shape.captchaToken,
}

export const loginSchema = z.object({
  ...authBaseFields,
  password: z.string().min(1, "passwordRequired"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  ...authBaseFields,
  password: z
    .string()
    .min(PASSWORD_RULES.minLength, "passwordTooShort")
    .max(PASSWORD_RULES.maxLength, "passwordTooLong")
    .regex(PASSWORD_RULES.uppercase, "passwordUppercaseRequired")
    .regex(PASSWORD_RULES.number, "passwordNumberRequired")
    .regex(PASSWORD_RULES.specialCharacter, "passwordSpecialCharacterRequired"),
  firstName: z.string().min(1, "firstNameRequired"),
  lastName: z.string().min(1, "lastNameRequired"),
  phone: z.e164("invalidPhone").refine(isValidPhoneNumber, {
    error: "invalidPhone",
  }),
  termsAndConditions: z
    .boolean()
    .refine((value) => value === true, { error: "termsAndConditionsRequired" }),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const otpSchema = z.object({
  otp: z.string().length(6, "otpMustBe6Digits").regex(OTP_DIGITS_ONLY_RULE, "otpMustBeDigits"),
})

export type OTPInput = z.infer<typeof otpSchema>
