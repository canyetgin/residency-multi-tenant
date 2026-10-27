import { type Locale } from "@/i18n/routing"

export const FlagIcons = ({ country }: { country: Locale }) => {
  const vectors: Record<string, React.JSX.Element> = {
    tr: (
      <svg
        xmlns="http://w3.org"
        viewBox="0 0 1200 800"
        width="100%"
        height="100%"
        className="pointer-events-none"
      >
        <rect width="1200" height="800" fill="#e30a17" />
        <circle cx="425" cy="400" r="200" fill="#fff" />
        <circle cx="475" cy="400" r="160" fill="#e30a17" />
        <polygon
          points="575,400 633.8,419.1 611.3,350 670.1,330.9 607.7,330.9"
          fill="#fff"
          transform="rotate(-18 630 370) scale(1.2) translate(-60 -30)"
        />
      </svg>
    ),
    en: (
      <svg
        xmlns="http://w3.org"
        viewBox="0 0 7410 3900"
        width="100%"
        height="100%"
        className="pointer-events-none"
      >
        <rect width="7410" height="3900" fill="#b22234" />
        <path
          d="M0,300H7410M0,900H7410M0,1500H7410M0,2100H7410M0,2700H7410M0,3300H7410"
          stroke="#fff"
          strokeWidth="300"
        />
        <rect width="2964" height="2100" fill="#3c3b6e" />
        <circle cx="1482" cy="1050" r="400" fill="#fff" opacity="0.4" />
      </svg>
    ),
  }

  return (
    <div
      className="h-3 w-4 shrink-0 inline-flex items-center pointer-events-none select-none"
      aria-hidden="true"
    >
      {vectors[country] || country.slice(0, 2)}
    </div>
  )
}
