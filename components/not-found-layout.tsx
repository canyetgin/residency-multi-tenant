"use client"
import NotFoundAnimation from "@/public/animations/404.lottie"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { useTranslations } from "next-intl"
import { BackButton } from "./back-button"

export const NotFoundLayout = () => {
  // we need this cuz we also import this to global not found page, which is not locale aware,
  // so we need to provide a default value for description
  const t = useTranslations("pages.404Page")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex w-full flex-1 flex-col items-center justify-center text-center px-4 py-8 max-w-sm">
        <DotLottieReact
          renderConfig={{ autoResize: true }}
          layout={{ fit: "contain" }}
          src={NotFoundAnimation}
          autoplay
        />
        <h1 className="text-2xl font-bold">{t("heading")}</h1>
        <p className="whitespace-pre-line text-sm my-4">{t("description")}</p>
        <BackButton />
      </div>
    </main>
  )
}
