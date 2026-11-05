"use client"

import { Check, ChevronDown, Globe } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const countries = RPNInput.getCountries()

type PhoneInputProps = Omit<
  React.ComponentProps<typeof RPNInput.default>,
  "value" | "onChange" | "countrySelectProps" | "reset"
> & {
  value?: string
  onChange?: (value: string) => void
}

function PhoneInput({
  className,
  value,
  onChange,
  onPaste,
  onChangeCapture,
  ref,
  ...props
}: PhoneInputProps) {
  const locale = useLocale()
  const t = useTranslations("auth")

  const [selection, setSelection] = React.useState<{
    country: RPNInput.Country
    reset?: number
  } | null>(null)

  const labels = React.useMemo(() => {
    const displayNames = new Intl.DisplayNames(locale, {
      type: "region",
    })

    return {
      country: t("phoneSelectCountry"),
      phone: t("phoneLabel"),
      ...Object.fromEntries(countries.map((country) => [country, displayNames.of(country)])),
    }
  }, [locale, t])

  const region = new Intl.Locale(locale).maximize().region

  const localeCountry = countries.find((country) => country === region) ?? "US"

  const selectedCountry = selection?.country ?? localeCountry

  const handleCountrySelect = (country: RPNInput.Country) => {
    onChange?.("")

    setSelection((previous) => ({
      country,
      reset: (previous?.reset ?? 0) + 1,
    }))
  }

  const handleInternationalNumber = (input: string) => {
    const raw = input.trim()

    if (!raw.startsWith("+")) return false

    const parsed = RPNInput.parsePhoneNumber(raw)

    if (!parsed?.country || !parsed.isValid() || !countries.includes(parsed.country)) {
      return false
    }

    onChange?.(parsed.number)

    setSelection((previous) =>
      previous?.country === parsed.country
        ? previous
        : {
            country: parsed.country!,
            reset: previous?.reset,
          }
    )

    return true
  }

  return (
    <RPNInput.default
      {...props}
      ref={ref}
      className={cn("flex min-w-0", className)}
      defaultCountry={selectedCountry}
      reset={selection?.reset}
      labels={labels}
      locales={locale}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      countrySelectProps={{
        onSelectCountry: handleCountrySelect,
      }}
      inputComponent={InputComponent}
      addInternationalOption={false}
      international={false}
      initialValueFormat="national"
      focusInputOnCountrySelection={false}
      limitMaxLength
      autoComplete="tel"
      value={value || undefined}
      onChange={(nextValue) => onChange?.(nextValue ?? "")}
      onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => {
        onPaste?.(event)

        if (event.defaultPrevented) return

        if (handleInternationalNumber(event.clipboardData.getData("text"))) {
          event.preventDefault()
        }
      }}
      onChangeCapture={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChangeCapture?.(event)

        if (event.isPropagationStopped()) return

        if (handleInternationalNumber(event.currentTarget.value)) {
          event.stopPropagation()
        }
      }}
    />
  )
}

function InputComponent({ className, ref, ...props }: React.ComponentPropsWithRef<"input">) {
  return (
    <Input
      {...props}
      ref={ref}
      className={cn("min-w-0 flex-1 rounded-s-none rounded-e-lg", className)}
    />
  )
}

type CountrySelectProps = {
  disabled?: boolean
  readOnly?: boolean
  value?: RPNInput.Country
  options: {
    label: string
    value?: RPNInput.Country
  }[]
  onSelectCountry: (country: RPNInput.Country) => void
  onFocus?: () => void
  onBlur?: () => void
  tabIndex?: number
}

function CountrySelect({
  disabled,
  readOnly,
  value,
  options,
  onSelectCountry,
  onFocus,
  onBlur,
  tabIndex,
}: CountrySelectProps) {
  const t = useTranslations("auth")

  const actionsRef =
    React.useRef<NonNullable<React.ComponentProps<typeof Popover>["actionsRef"]>["current"]>(null)

  const selectedCountry = options.find((option) => option.value === value)

  const callingCode = value ? RPNInput.getCountryCallingCode(value) : undefined

  return (
    <Popover actionsRef={actionsRef}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled || readOnly}
            tabIndex={tabIndex}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-label={
              value
                ? t("phoneChangeCountry", {
                    country: selectedCountry?.label ?? value,
                    code: `+${callingCode}`,
                  })
                : t("phoneSelectCountry")
            }
            className={cn(
              "h-8 w-30 shrink-0 gap-2 rounded-s-lg rounded-e-none",
              "border-e-0 px-2.5 focus-visible:z-10"
            )}
          />
        }
      >
        <FlagComponent country={value} countryName={selectedCountry?.label ?? ""} />

        {callingCode && <span className="shrink-0 text-sm tabular-nums">+{callingCode}</span>}

        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[min(20rem,calc(100vw-2rem))] p-0">
        <PopoverTitle className="sr-only">{t("phoneSelectCountry")}</PopoverTitle>

        <Command>
          <CommandInput
            aria-label={t("phoneCountrySearch")}
            placeholder={t("phoneCountrySearch")}
          />

          <CommandList className="max-h-72">
            <CommandEmpty>{t("phoneCountryNotFound")}</CommandEmpty>

            <CommandGroup>
              {options.map(({ value: country, label }) => {
                if (!country) return null

                const code = RPNInput.getCountryCallingCode(country)

                const selected = country === value

                return (
                  <CommandItem
                    key={country}
                    value={`${label} ${country} +${code}`}
                    onSelect={() => {
                      actionsRef.current?.close()

                      if (!selected) {
                        onSelectCountry(country)
                      }
                    }}
                    className="gap-2"
                  >
                    <FlagComponent country={country} countryName={label} />

                    <span className="min-w-0 flex-1 truncate">{label}</span>

                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      +{code}
                    </span>

                    {selected && <span className="sr-only">{t("phoneSelected")}</span>}

                    <Check
                      aria-hidden="true"
                      className={cn(
                        "ml-auto size-4 shrink-0",
                        selected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type FlagComponentProps = {
  country?: RPNInput.Country
  countryName: string
}

function FlagComponent({ country, countryName }: FlagComponentProps) {
  const Flag = country ? flags[country] : undefined

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-4 w-6 shrink-0 items-center justify-center",
        "overflow-hidden rounded-sm",
        "[&_svg:not([class*='size-'])]:size-full"
      )}
    >
      {Flag ? <Flag title={countryName} /> : <Globe className="size-4 text-muted-foreground" />}
    </span>
  )
}

export { PhoneInput }
export type { PhoneInputProps }
