import { type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { Globe } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

type FlagIconProps = {
  country?: Locale | RPNInput.Country
  className?: string
}

const COUNTRIES = RPNInput.getCountries()

export const FlagIcon = ({ country, className }: FlagIconProps) => {
  const code = country?.toUpperCase()

  const region = country
    ? COUNTRIES.includes(code as RPNInput.Country)
      ? code
      : new Intl.Locale(country).maximize().region
    : undefined

  const Flag = region ? flags[region as RPNInput.Country] : undefined

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-4 w-5 shrink-0 items-center justify-center",
        "overflow-hidden pointer-events-none select-none",
        "[&_svg:not([class*='size-'])]:size-full",
        className
      )}
    >
      {Flag ? <Flag title={region ?? ""} /> : <Globe className="size-full" />}
    </span>
  )
}
