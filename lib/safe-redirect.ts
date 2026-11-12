const UNSAFE = /[\u0000-\u0020\u007f\\]|(^|\/)(\.|%2e){1,2}(\/|\?|#|$)/i

const MAX_REDIRECT_LENGTH = 2048

// for Open Redirect Vulnerability (CWE-601)
export function safeRedirect(target: unknown, fallback: string = "/dashboard"): string {
  if (typeof target !== "string" || target.length > MAX_REDIRECT_LENGTH) {
    return fallback
  }

  if (!/^\/(?!\/)/.test(target) || UNSAFE.test(target)) {
    return fallback
  }

  return target
}
