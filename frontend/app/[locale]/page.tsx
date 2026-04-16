import { LandingHero } from "@/components/landing-hero";
import { LayoutShell } from "@/components/layout-shell";
import { resolveLocale } from "@/lib/i18n";


export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return (
    <LayoutShell locale={locale} marketing>
      <LandingHero locale={locale} />
    </LayoutShell>
  );
}

