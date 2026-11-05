import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_RULES = {
  uppercase: /\p{Lu}/u,
  number: /\p{Nd}/u,
  specialCharacter: /[\p{P}\p{S}]/u,
  minLength: 8,
  maxLength: 128,
} as const

export const OTP_DIGITS_ONLY_RULE = /^\d+$/

const authBaseFields = {
  email: z.email("invalidEmail"),
  captchaToken: z.string().min(1, "invalidCaptcha"),
}

export const loginSchema = z.object({
  ...authBaseFields,
  password: z.string().min(1, "passwordRequired"),
})

export type loginSchemeValues = z.infer<typeof loginSchema>

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

export type registerSchemeValues = z.infer<typeof registerSchema>

export const OTPSchema = z.object({
  otp: z.string().length(6, "otpMustBe6Digits").regex(OTP_DIGITS_ONLY_RULE, "otpMustBeDigits"),
})

export type OTPSchemeValues = z.infer<typeof OTPSchema>
