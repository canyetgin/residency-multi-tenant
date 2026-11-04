"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/navigation"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

const backButtonVariants = cva("", {
  variants: {
    variant: {
      text: "",
      icon: "size-9 p-0",
    },
  },
  defaultVariants: {
    variant: "text",
  },
})

type BackButtonProps = VariantProps<typeof backButtonVariants>

type BrowserNavigation = {
  canGoBack: boolean
}

export function BackButton({ variant }: BackButtonProps) {
  const router = useRouter()
  const t = useTranslations("general")

  const handleBack = () => {
    const navigation = (window as Window & { navigation?: BrowserNavigation }).navigation

    if (navigation?.canGoBack) {
      router.back()
      return
    }

    router.replace("/")
  }

  const isIconOnly = variant === "icon"

  return (
    <Button
      type="button"
      variant="secondary"
      className={backButtonVariants({ variant })}
      aria-label={isIconOnly ? t("goBack") : undefined}
      onClick={handleBack}
    >
      {isIconOnly ? <ArrowLeft aria-hidden="true" /> : t("goBack")}
    </Button>
  )
}
