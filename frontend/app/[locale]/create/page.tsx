import { CreateStoryWizard } from "@/components/create-story-wizard";
import { LayoutShell } from "@/components/layout-shell";
import { resolveLocale } from "@/lib/i18n";


export default async function CreatePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  return (
    <LayoutShell locale={locale} active="create">
      <CreateStoryWizard locale={locale} />
    </LayoutShell>
  );
}

