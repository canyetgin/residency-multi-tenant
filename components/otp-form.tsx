"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "@/components/ui/toast"
import { resendOtpAction, resetOtpSessionAction, verifyOtpAction } from "@/features/actions/auth"
import { useRouter } from "@/i18n/navigation"
import { OTPSchema, type OTPSchemeValues } from "@/schemes/auth.scheme"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailIcon, RefreshCwIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"

const DIGITS_ONLY = "^\\d+$"

type OTPFormProps = {
  expiresAt: number
  initialCountdown: number
}

export const OTPForm = ({ expiresAt, initialCountdown }: OTPFormProps) => {
  const t = useTranslations("auth")
  const router = useRouter()

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

  const { isSubmitting } = formState

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
    startTransitionResend(async () => {
      const res = await resendOtpAction()

      if (!res.success) {
        toast.add({
          type: "error",
          description: t(res.error),
        })
        return
      }
      reset()

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
    const res = await verifyOtpAction(values)

    if (!res.success) {
      return toast.add({
        type: "error",
        description: t(res.error),
      })
    }

    router.replace("/dashboard")
  })

  const handleSwitchAccount = () => {
    reset()
    startTransitionSwitch(async () => {
      const res = await resetOtpSessionAction()

      if (res.success) {
        router.replace("/login")
      }
    })
  }

  const isCountingDown = countdown > 0

  const isDisabled = isSubmitting || isPendingSwitch || isPendingResend

  return (
    <form className="flex w-full max-w-sm flex-col gap-6" onSubmit={onSubmit}>
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
                  aria-label={t("otpLabel")}
                  pattern={DIGITS_ONLY}
                  aria-invalid={fieldState.invalid}
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
