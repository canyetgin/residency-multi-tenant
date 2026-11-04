"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

const backButtonVariants = cva("", {
  variants: {
    variant: {
      text: "",
      icon: "size-9 p-0 h-[1.2rem] w-[1.2rem]",
    },
  },
  defaultVariants: {
    variant: "text",
  },
})

type BackButtonProps = VariantProps<typeof backButtonVariants>

export function BackButton({ variant }: BackButtonProps) {
  const router = useRouter()
  const t = useTranslations("general")

  const handleBack = () => {
    if ("navigation" in window) {
      const { currentEntry } = window.navigation
      const previousEntry = window.navigation.entries()[(currentEntry?.index ?? 0) - 1]

      if (previousEntry) {
        router.back()
        return
      }
    }

    router.replace("/")
  }

  const isIconOnly = variant === "icon"

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn(backButtonVariants({ variant }))}
      aria-label={isIconOnly ? t("goBack") : undefined}
      onClick={handleBack}
    >
      {isIconOnly ? <ArrowLeft aria-hidden="true" /> : t("goBack")}
    </Button>
  )
}
