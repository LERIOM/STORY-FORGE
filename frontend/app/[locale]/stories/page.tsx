import { LayoutShell } from "@/components/layout-shell";
import { StoriesGallery } from "@/components/stories-gallery";
import { getMessages, resolveLocale } from "@/lib/i18n";


export default async function StoriesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const copy = getMessages(locale);

  return (
    <LayoutShell locale={locale} active="stories">
      <section style={{ display: "grid", gap: 20 }}>
        <div className="glass-panel" style={{ padding: "24px 20px", display: "grid", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>
            {copy.stories.title}
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            {copy.stories.subtitle}
          </p>
        </div>
        <StoriesGallery locale={locale} />
      </section>
    </LayoutShell>
  );
}
