import { z } from "zod"

const authBaseFields = {
  email: z.email("invalidEmail"),
  password: z.string().min(8, "passwordTooShort"),
}

export const loginSchema = z.object({
  ...authBaseFields,
})

export type loginSchemeValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  ...authBaseFields,
  organizationName: z.string().min(1, "organizationNameRequired"),
  phoneNumber: z.e164("invalidPhoneNumber").min(10, "phoneTooShort"),
  city: z.string().min(1, "cityRequired"),
  state: z.string().min(1, "stateRequired"),
  zipCode: z.string().min(1, "zipCodeRequired"),
  termsAndConditions: z.boolean().refine((value) => value === true, {
    message: "termsAndConditionsRequired",
  }),
})

export type registerSchemeValues = z.infer<typeof registerSchema>
