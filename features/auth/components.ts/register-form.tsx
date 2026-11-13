"use client"

import { GoogleIcon } from "@/components/icons/google-icon"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { loginAction } from "@/features/auth/actions"
import { Link } from "@/i18n/navigation"
import { registerSchema, registerSchemeValues } from "@/schemes/auth.scheme"
import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile"
import { useLocale, useTranslations } from "next-intl"
import { useRef } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { PhoneInput } from "../../../components/ui/phone-input"

export const RegisterForm = () => {
  const t = useTranslations("auth")
  const locale = useLocale()
  const { handleSubmit, control, formState } = useForm<registerSchemeValues>({
    defaultValues: {
      email: "",
      password: "",
      termsAndConditions: false,
      captchaToken: "",
      phone: "",
      firstName: "",
      lastName: "",
    },
    resolver: zodResolver(registerSchema),
  })

  const turnstileRef = useRef<TurnstileInstance>(null)

  // eslint-disable-next-line react-hooks/refs
  const onSubmit = handleSubmit(async (values) => {
    const res = await loginAction(values)
    toast.add({
      type: "error",
      description: t(res.error),
    })
    // need to get fresh captchaToken before the next attempt
    turnstileRef?.current?.reset()
  })
  const { isSubmitting } = formState
  const phone = useWatch({
    control: control,
    name: "phone",
  })
  return (
    <form className="w-full max-w-md" onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-2xl">{t("registerTitle")}</h1>
          <p className="text-muted-foreground text-sm">{t("registerSubtitle")}</p>
        </div>
        <pre>{JSON.stringify({ phone }, null, 2)}</pre>
        <FieldSet>
          <FieldLegend>{t("registerAccountDetails")}</FieldLegend>
          <FieldGroup>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-form-email">{t("email")}</FieldLabel>
                  <Input
                    {...field}
                    id="login-form-email"
                    placeholder={t("emailPlaceholder")}
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    aria-disabled={isSubmitting}
                    disabled={isSubmitting}
                  />

                  <FieldError>
                    {fieldState.error?.message && t(fieldState.error.message)}
                  </FieldError>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-form-password">{t("password")}</FieldLabel>
                  <Input
                    {...field}
                    id="login-form-password"
                    placeholder={t("passwordPlaceholder")}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    aria-disabled={isSubmitting}
                    disabled={isSubmitting}
                  />

                  <FieldError>
                    {fieldState.error?.message && t(fieldState.error.message)}
                  </FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>{t("registerPersonalInformation")}</FieldLegend>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstName">{t("firstNameLabel")}</FieldLabel>
                    <Input
                      {...field}
                      id="firstName"
                      placeholder={t("firstNamePlaceholder")}
                      type="text"
                      autoComplete="given-name"
                      aria-invalid={fieldState.invalid}
                      aria-disabled={isSubmitting}
                      disabled={isSubmitting}
                    />
                    <FieldError>
                      {fieldState.error?.message && t(fieldState.error.message)}
                    </FieldError>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastName">{t("lastNameLabel")}</FieldLabel>
                    <Input
                      {...field}
                      id="lastName"
                      placeholder={t("lastNamePlaceholder")}
                      type="text"
                      autoComplete="family-name"
                      aria-invalid={fieldState.invalid}
                      aria-disabled={isSubmitting}
                      disabled={isSubmitting}
                    />
                    <FieldError>
                      {fieldState.error?.message && t(fieldState.error.message)}
                    </FieldError>
                  </Field>
                )}
              />
            </div>
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-form-phone">{t("phoneLabel")}</FieldLabel>

                  <PhoneInput
                    {...field}
                    id="register-form-phone"
                    placeholder={t("phonePlaceholder")}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                  />

                  <FieldError>
                    {fieldState.error?.message && t(fieldState.error.message)}
                  </FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <Controller
          control={control}
          name="captchaToken"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
                onSuccess={(token) => field.onChange(token)}
                onExpire={() => {
                  field.onChange("")
                  turnstileRef.current?.reset()
                }}
                onTimeout={() => {
                  field.onChange("")
                  turnstileRef.current?.reset()
                }}
                onError={() => {
                  field.onChange("")
                }}
                options={{
                  size: "flexible",
                  language: locale,
                }}
              />
              <FieldError>{fieldState.error?.message && t(fieldState.error.message)}</FieldError>
            </Field>
          )}
        />
        <Field className="flex flex-col gap-3">
          <Button
            className="w-full"
            type="submit"
            aria-disabled={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("registering") : t("register")}
          </Button>

          <Button
            className="w-full"
            variant="outline"
            type="button"
            aria-disabled={isSubmitting}
            disabled={isSubmitting}
          >
            <GoogleIcon />
            {t("registerWithGoogle")}
          </Button>

          <p className="text-center text-muted-foreground text-sm mt-2">
            {t("haveAccount")}{" "}
            <Link
              className={`underline font-normal text-foreground underline-offset-4`}
              href="/auth/login"
            >
              {t("login")}
            </Link>
          </p>
        </Field>
      </FieldGroup>
    </form>
  )
}
