"use client"

import { GoogleIcon } from "@/components/icons/google-icon"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { loginAction } from "@/features/auth/actions"
import { Link } from "@/i18n/navigation"
import { loginSchema, type loginSchemeValues } from "@/schemes/auth.scheme"
import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"

export const LoginForm = () => {
  const t = useTranslations("auth")
  const locale = useLocale()

  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const { handleSubmit, control, formState } = useForm<loginSchemeValues>({
    defaultValues: {
      email: "",
      password: "",
      captchaToken: "",
    },
    resolver: zodResolver(loginSchema),
  })

  const turnstileRef = useRef<TurnstileInstance>(null)

  // eslint-disable-next-line react-hooks/refs
  const onSubmit = handleSubmit(async (values) => {
    const res = await loginAction(values, next)

    toast.add({
      type: "error",
      description: t(res.error),
    })
    // need to get fresh captchaToken before the next attempt
    turnstileRef?.current?.reset()
  })

  const { isSubmitting } = formState

  return (
    <form className="w-full max-w-sm" onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-2xl">{t("loginTitle")}</h1>
          <p className="text-muted-foreground text-sm">{t("loginSubtitle")}</p>
        </div>
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

              <FieldError>{fieldState.error?.message && t(fieldState.error.message)}</FieldError>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="login-form-password">{t("password")}</FieldLabel>
                <Link
                  className={`text-muted-foreground text-sm hover:underline ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
                  href="/forgot-password"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                {...field}
                id="login-form-password"
                placeholder={t("passwordPlaceholder")}
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                aria-disabled={isSubmitting}
                disabled={isSubmitting}
              />

              <FieldError>{fieldState.error?.message && t(fieldState.error.message)}</FieldError>
            </Field>
          )}
        />
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
            {isSubmitting ? t("loggingIn") : t("login")}
          </Button>

          <Button
            className="w-full"
            variant="outline"
            type="button"
            aria-disabled={isSubmitting}
            disabled={isSubmitting}
          >
            <GoogleIcon />
            {t("loginWithGoogle")}
          </Button>

          <p className="text-center text-muted-foreground text-sm mt-2">
            {t("dontHaveAccount")}{" "}
            <Link
              className={`underline font-normal text-foreground underline-offset-4`}
              href="/auth/register"
            >
              {t("register")}
            </Link>
          </p>
        </Field>
      </FieldGroup>
    </form>
  )
}
