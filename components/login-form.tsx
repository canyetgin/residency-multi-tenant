"use client"

import { GoogleIcon } from "@/components/icons/google-icon"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { loginAction } from "@/features/actions/auth"
import { Link, useRouter } from "@/i18n/navigation"
import { loginSchema, type loginSchemeValues } from "@/schemes/auth.scheme"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

export const LoginForm = () => {
  const t = useTranslations("auth")
  const router = useRouter()

  const { handleSubmit, control, formState } = useForm<loginSchemeValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    //need to unregister each time for security concerns. if user on verify page wanna switch account, it wont render old inputs
    shouldUnregister: true,
    resolver: zodResolver(loginSchema),
  })

  const { isSubmitting } = formState

  const onSubmit = handleSubmit(async (values) => {
    const res = await loginAction(values)
    if (!res.success) {
      return toast.add({
        type: "error",
        description: t(res.error),
      })
    }
    router.replace("/login/verify")
  })

  return (
    <form className="w-full max-w-sm" onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-2xl">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
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
                aria-invalid={fieldState.invalid}
                placeholder={t("emailPlaceholder")}
                type="email"
                autoComplete="email"
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
                aria-invalid={fieldState.invalid}
                placeholder={t("passwordPlaceholder")}
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
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
              href="/register"
            >
              {t("register")}
            </Link>
          </p>
        </Field>
      </FieldGroup>
    </form>
  )
}
