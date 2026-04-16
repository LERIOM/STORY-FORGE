import Link from "next/link";

import { LayoutShell } from "@/components/layout-shell";
import { StoryDetailView } from "@/components/story-detail-view";
import { resolveLocale } from "@/lib/i18n";


export default async function StoryDetailPage({
  params
}: {
  params: Promise<{ locale: string; storyId: string }>;
}) {
  const { locale: rawLocale, storyId } = await params;
  const locale = resolveLocale(rawLocale);

  return (
    <LayoutShell locale={locale} active="stories">
      <section style={{ display: "grid", gap: 18 }}>
        <Link href={`/${locale}/stories`} className="ghost-button" style={{ width: "fit-content" }}>
          {locale === "fr" ? "Retour à Mes stories" : "Back to My stories"}
        </Link>
        <StoryDetailView locale={locale} storyId={storyId} />
      </section>
    </LayoutShell>
  );
}

