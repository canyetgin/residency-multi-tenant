"use client"

import { ChevronsUpDown } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"
import * as RPNInput from "react-phone-number-input"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useMemo, useRef, useState } from "react"
import { FlagIcon } from "../flag-icon"

const COUNTRIES = RPNInput.getCountries()

type PhoneInputProps = Omit<
  React.ComponentPropsWithRef<typeof RPNInput.default>,
  "value" | "onChange" | "countrySelectProps" | "reset"
> & {
  value?: string
  onChange?: (value: string) => void
}

export const PhoneInput = ({
  className,
  value,
  onChange,
  onPaste,
  ref,
  ...props
}: PhoneInputProps) => {
  const locale = useLocale()

  const [manualCountry, setManualCountry] = useState<RPNInput.Country>()

  const pendingManualChange = useRef(false)

  const labels = useMemo(() => {
    const displayNames = new Intl.DisplayNames(locale, {
      type: "region",
    })

    return {
      ...Object.fromEntries(COUNTRIES.map((country) => [country, displayNames.of(country)])),
    }
  }, [locale])

  const localeCountry = useMemo(() => {
    const region = new Intl.Locale(locale).maximize().region

    return COUNTRIES.find((country) => country === region)
  }, [locale])

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(event)

    if (event.defaultPrevented) return

    const pasted = event.clipboardData.getData("text").trim()

    if (!pasted.startsWith("+")) return

    const parsed = RPNInput.parsePhoneNumber(pasted)

    if (!parsed?.country || !parsed.isValid()) return

    event.preventDefault()

    setManualCountry(parsed.country)
    onChange?.(parsed.number)
  }

  return (
    <RPNInput.default
      {...props}
      ref={ref}
      className={cn("flex min-w-0", className)}
      flagComponent={FlagIcon}
      countrySelectComponent={CountrySelect}
      countrySelectProps={{
        onManualCountrySelect: (country: RPNInput.Country) => {
          pendingManualChange.current = true
          setManualCountry(country)
        },
      }}
      inputComponent={InputComponent}
      smartCaret={false}
      defaultCountry={manualCountry ?? localeCountry}
      labels={labels}
      locales={locale}
      addInternationalOption={false}
      international={false}
      initialValueFormat="national"
      focusInputOnCountrySelection={false}
      limitMaxLength
      autoComplete="tel"
      value={value || undefined}
      onChange={(nextValue) => {
        if (pendingManualChange.current) {
          pendingManualChange.current = false
          onChange?.("")
          return
        }

        onChange?.(nextValue ?? "")
      }}
      onPaste={handlePaste}
    />
  )
}

const InputComponent = ({ className, ref, ...props }: React.ComponentPropsWithRef<"input">) => (
  <Input
    {...props}
    ref={ref}
    className={cn("min-w-0 flex-1 rounded-e-lg rounded-s-none", className)}
  />
)

type CountryEntry = {
  label: string
  value: RPNInput.Country | undefined
}

type CountrySelectProps = {
  disabled?: boolean
  readOnly?: boolean
  value?: RPNInput.Country
  options: CountryEntry[]
  onChange: (country?: RPNInput.Country) => void
  onManualCountrySelect: (country: RPNInput.Country) => void
}

const CountrySelect = ({
  disabled,
  readOnly,
  value: selectedCountry,
  options: countryList,
  onChange,
  onManualCountrySelect,
}: CountrySelectProps) => {
  const t = useTranslations("auth")

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [searchValue, setSearchValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const selectedCountryName = countryList.find((option) => option.value === selectedCountry)?.label

  const callingCode = selectedCountry ? RPNInput.getCountryCallingCode(selectedCountry) : undefined

  return (
    <Popover
      open={isOpen}
      modal
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open) setSearchValue("")
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "flex h-8 w-26 shrink-0 gap-1 justify-between flex-nowrap",
              "rounded-e-none rounded-s-lg border-e-0 ",
              "focus-visible:z-10"
            )}
            disabled={disabled || readOnly}
            aria-label={
              selectedCountry
                ? t("phoneChangeCountry", {
                    country: selectedCountryName ?? selectedCountry,
                    code: `+${callingCode}`,
                  })
                : t("phoneSelectCountry")
            }
          />
        }
      >
        <div className="flex items-center gap-1">
          <FlagIcon country={selectedCountry} />
          {callingCode && <span className="shrink-0 text-sm tabular-nums">+{callingCode}</span>}
        </div>
        <ChevronsUpDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 opacity-50", disabled ? "hidden" : "opacity-100")}
        />
      </PopoverTrigger>

      <PopoverContent className="w-75 p-0">
        <PopoverTitle className="sr-only">{t("phoneSelectCountry")}</PopoverTitle>

        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value)

              setTimeout(() => {
                const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
                  "[data-radix-scroll-area-viewport]"
                )

                if (viewport) {
                  viewport.scrollTop = 0
                }
              }, 0)
            }}
            aria-label={t("phoneCountrySearch")}
            placeholder={t("phoneCountrySearch")}
          />

          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>{t("phoneCountryNotFound")}</CommandEmpty>

              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      onManualCountrySelect={onManualCountrySelect}
                      onSelectComplete={() => setIsOpen(false)}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type CountrySelectOptionProps = RPNInput.FlagProps & {
  selectedCountry?: RPNInput.Country
  onChange: (country: RPNInput.Country) => void
  onManualCountrySelect: (country: RPNInput.Country) => void
  onSelectComplete: () => void
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onManualCountrySelect,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const isChecked = selectedCountry === country
  const t = useTranslations("auth")
  const callingCode = RPNInput.getCountryCallingCode(country)

  const handleSelect = () => {
    if (!isChecked) {
      onManualCountrySelect(country)
      onChange(country)
    }
    onSelectComplete()
  }

  return (
    <CommandItem
      value={`${countryName} ${country} +${callingCode}`}
      className="gap-2"
      data-checked={isChecked}
      onSelect={handleSelect}
    >
      <FlagIcon country={country} />

      <span className="min-w-0 flex-1 truncate text-sm">{countryName}</span>

      <span className="shrink-0 text-sm tabular-nums text-foreground/50">+{callingCode}</span>

      {isChecked && <span className="sr-only">{t("phoneSelected")}</span>}
    </CommandItem>
  )
}

export type { PhoneInputProps }
