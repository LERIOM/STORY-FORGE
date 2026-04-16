import { ConnectPanel } from "@/components/connect-panel";
import { LayoutShell } from "@/components/layout-shell";
import { resolveLocale } from "@/lib/i18n";


export default async function ConnectPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return (
    <LayoutShell locale={locale} marketing>
      <ConnectPanel locale={locale} />
    </LayoutShell>
  );
}

