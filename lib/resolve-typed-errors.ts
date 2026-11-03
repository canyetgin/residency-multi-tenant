export type ResolveTypedErrorParams<TErrors extends readonly string[], TFallback extends string> = {
  error: unknown
  allowedErrors: TErrors
  fallback: TFallback
}

export function resolveTypedError<
  const TErrors extends readonly string[],
  const TFallback extends string,
>({
  error,
  allowedErrors,
  fallback,
}: ResolveTypedErrorParams<TErrors, TFallback>): TErrors[number] | TFallback {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : ""

  return (allowedErrors as readonly string[]).includes(message)
    ? (message as TErrors[number])
    : fallback
}
