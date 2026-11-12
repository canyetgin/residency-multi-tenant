"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "@/components/ui/toast"
import { otpResendAction, otpResetSessionAction, otpVerifyAction } from "@/features/auth/actions"
import { OTP_DIGITS_ONLY_RULE, OTPSchema, type OTPSchemeValues } from "@/schemes/auth.scheme"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailIcon, RefreshCwIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"

type OTPFormProps = {
  expiresAt: number
  initialCountdown: number
}

export const OTPForm = ({ expiresAt, initialCountdown }: OTPFormProps) => {
  const t = useTranslations("auth")

  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const overriddenExpiresAtRef = useRef<number | null>(null)

  const [countdown, setCountdown] = useState(initialCountdown)

  const [isPendingResend, startTransitionResend] = useTransition()
  const [isPendingSwitch, startTransitionSwitch] = useTransition()

  const { handleSubmit, control, formState, reset } = useForm<OTPSchemeValues>({
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(OTPSchema),
  })

  useEffect(() => {
    const updateCountdown = () => {
      const activeExpiresAt = overriddenExpiresAtRef.current ?? expiresAt

      const remaining = Math.max(0, Math.ceil((activeExpiresAt - Date.now()) / 1000))

      setCountdown(remaining)
    }

    updateCountdown()

    const timer = setInterval(updateCountdown, 250)

    return () => {
      clearInterval(timer)
    }
  }, [expiresAt])

  const handleResend = () => {
    reset()
    startTransitionResend(async () => {
      const res = await otpResendAction()

      if (!res.success) {
        toast.add({
          type: "error",
          description: t(res.error),
        })
        return
      }

      overriddenExpiresAtRef.current = res.expiresAt
      setCountdown(Math.max(0, Math.ceil((res.expiresAt - Date.now()) / 1000)))

      toast.add({
        type: "success",
        timeout: 3000,
        description: t("otpResentSuccess", {
          email: "cannyetgin@gmail.com",
        }),
      })
    })
  }

  const onSubmit = handleSubmit(async (values) => {
    const res = await otpVerifyAction(values, next)
    return toast.add({
      type: "error",
      description: t(res.error),
    })
  })

  const handleSwitchAccount = () => {
    startTransitionSwitch(async () => {
      await otpResetSessionAction()
    })
  }

  const isCountingDown = countdown > 0
  const { isSubmitting } = formState
  const isDisabled = isSubmitting || isPendingSwitch || isPendingResend

  return (
    <form className="w-full flex flex-col gap-6 max-w-sm" onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <MailIcon aria-hidden="true" className="size-6 text-primary" />
        </div>
      </div>

      <FieldGroup>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-2xl">{t("otpTitle")}</h1>

          <p className="text-muted-foreground text-sm">
            {t("otpSubtitle", {
              email: "cannyetgin@gmail.com",
            })}
          </p>
        </div>

        <Controller
          control={control}
          name="otp"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex justify-center">
                <InputOTP
                  id="otp-verification"
                  maxLength={6}
                  autoComplete="one-time-code"
                  pattern={OTP_DIGITS_ONLY_RULE.source}
                  aria-label={t("otpLabel")}
                  aria-invalid={fieldState.invalid}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  {...field}
                >
                  <InputOTPGroup>
                    <InputOTPSlot className="h-10 w-10 bg-background" index={0} />
                    <InputOTPSlot className="h-10 w-10 bg-background" index={1} />
                    <InputOTPSlot className="h-10 w-10 bg-background" index={2} />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot className="h-10 w-10 bg-background" index={3} />
                    <InputOTPSlot className="h-10 w-10 bg-background" index={4} />
                    <InputOTPSlot className="h-10 w-10 bg-background" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <FieldError className="text-center">
                {fieldState.error?.message && t(fieldState.error.message)}
              </FieldError>
            </Field>
          )}
        />

        <Field className="flex flex-col gap-3">
          <Button className="w-full" type="submit" aria-disabled={isDisabled} disabled={isDisabled}>
            {isSubmitting ? t("otpVerifying") : t("otpVerify")}
          </Button>

          <Button
            className="w-full"
            variant="outline"
            type="button"
            onClick={handleResend}
            disabled={isCountingDown || isDisabled}
            aria-disabled={isCountingDown || isDisabled}
          >
            <RefreshCwIcon className={isPendingResend ? "animate-spin" : ""} />

            {isCountingDown
              ? t("otpCountDown", {
                  countdown,
                })
              : t("otpResendCode")}
          </Button>

          <div className="mt-2 text-center text-muted-foreground text-sm">
            <span>{t("otpSwitchAccount")}</span>{" "}
            <Button
              className="h-auto p-0 font-normal underline"
              onClick={handleSwitchAccount}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              type="button"
              variant="link"
            >
              {t("otpSwitchAccountAction")}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  )
}
