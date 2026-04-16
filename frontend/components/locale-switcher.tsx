"use client";

import { usePathname, useRouter } from "next/navigation";

import { LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";


type LocaleSwitcherProps = {
  locale: Locale;
};


export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  function onChange(nextLocale: string) {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000`;
    router.push(segments.join("/") || `/${nextLocale}`);
  }

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.78)"
      }}
    >
      <span className="muted" style={{ fontSize: "0.9rem" }}>
        Lang
      </span>
      <select
        aria-label="Select language"
        value={locale}
        onChange={(event) => onChange(event.target.value)}
        style={{
          border: 0,
          background: "transparent",
          color: "var(--text)",
          outline: "none"
        }}
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item} value={item}>
            {item.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

