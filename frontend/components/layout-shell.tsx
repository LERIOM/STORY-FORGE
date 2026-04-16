import Image from "next/image";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/lib/i18n";


type LayoutShellProps = {
  locale: Locale;
  active?: "create" | "stories" | "profile";
  children: React.ReactNode;
  marketing?: boolean;
};


export function LayoutShell({ locale, active, children, marketing = false }: LayoutShellProps) {
  const links = [
    { key: "create", label: locale === "fr" ? "Créer" : "Create", href: `/${locale}/create` },
    { key: "stories", label: locale === "fr" ? "Mes stories" : "My stories", href: `/${locale}/stories` },
    { key: "profile", label: locale === "fr" ? "Profil" : "Profile", href: `/${locale}/profile` }
  ] as const;

  return (
    <div className={marketing ? "marketing-shell" : "product-shell"}>
      <div className="page-shell">
        <header
          className="glass-panel"
          style={{
            display: "grid",
            gap: 18,
            padding: "18px 20px",
            marginBottom: marketing ? 32 : 24,
            position: "sticky",
            top: 16,
            zIndex: 30
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap"
            }}
          >
            <Link href={`/${locale}`} className="brand-link">
              <span className="brand-mark">
                <Image
                  src="/storyforge-logo.png"
                  alt="Story Forge logo"
                  width={96}
                  height={96}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                  }}
                  priority
                />
              </span>
              <span className="brand-title">Story Forge</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!marketing && (
                <nav
                  style={{
                    display: "none",
                    gap: 10
                  }}
                  className="desktop-nav"
                >
                  {links.map((link) => {
                    const selected = active === link.key;
                    return (
                      <Link
                        key={link.key}
                        href={link.href}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 999,
                          background: selected ? "var(--accent-soft)" : "transparent",
                          color: selected ? "var(--accent)" : "var(--text-soft)",
                          border: selected ? "1px solid rgba(15, 118, 110, 0.18)" : "1px solid transparent",
                          fontWeight: 600
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              )}
              <LocaleSwitcher locale={locale} />
            </div>
          </div>
        </header>

        {children}
      </div>

      {!marketing && (
        <nav
          style={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(calc(100% - 24px), 460px)",
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            padding: 10,
            background: "rgba(255,255,255,0.9)",
            border: "1px solid var(--line)",
            borderRadius: 999,
            backdropFilter: "blur(18px)",
            boxShadow: "var(--shadow-soft)",
            zIndex: 40
          }}
          className="mobile-bottom-nav"
        >
          {links.map((link) => {
            const selected = active === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "12px 8px",
                  borderRadius: 999,
                  fontWeight: 700,
                  background: selected ? "var(--accent)" : "transparent",
                  color: selected ? "white" : "var(--text-soft)"
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
