"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteStory, fetchStories, fetchStory, toAbsoluteApiUrl } from "@/lib/api";
import { excerpt, formatStoryDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { StoryDetail, StorySummary } from "@/lib/types";
import { StoryDetailView } from "@/components/story-detail-view";


type StoriesGalleryProps = {
  locale: Locale;
};


export function StoriesGallery({ locale }: StoriesGalleryProps) {
  const router = useRouter();
  const isFrench = locale === "fr";
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryDetail | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 980px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchStories()
      .then((payload) => {
        if (!cancelled) {
          setStories(payload);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load stories");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function onDelete(storyId: string) {
    const confirmed = window.confirm(
      isFrench ? "Supprimer cette story ?" : "Delete this story?"
    );
    if (!confirmed) return;

    try {
      await deleteStory(storyId);
      setStories((current) => current.filter((item) => item.id !== storyId));
      if (selectedStory?.id === storyId) {
        setSelectedStory(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete story");
    }
  }

  if (loading) {
    return <div className="empty-state"><strong>{isFrench ? "Chargement…" : "Loading…"}</strong></div>;
  }

  if (error) {
    return <div className="empty-state"><strong>{error}</strong></div>;
  }

  if (!stories.length) {
    return (
      <div className="empty-state">
        <strong>{isFrench ? "Aucune story pour le moment" : "No stories yet"}</strong>
        <p className="muted" style={{ marginBottom: 0 }}>
          {isFrench ? "Crée une première story pour remplir la bibliothèque." : "Create a first story to populate the library."}
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="stories-grid">
        {stories.map((story) => (
          <article key={story.id} className="surface-card story-card">
            <div className="story-card-preview">
              <img
                className="story-card-image"
                src={toAbsoluteApiUrl(story.image_url)}
                alt={story.context_text}
              />
            </div>
            <div className="story-card-copy">
              <strong>{formatStoryDate(story.created_at, locale)}</strong>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
                {excerpt(story.context_text)}
              </p>
            </div>
            <div className="story-card-actions">
              {isDesktop ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={async () => {
                    router.prefetch(`/${locale}/stories/${story.id}`);
                    const detail = await fetchStory(story.id);
                    setSelectedStory(detail);
                  }}
                >
                  {isFrench ? "Voir" : "View"}
                </button>
              ) : (
                <Link href={`/${locale}/stories/${story.id}`} className="primary-button">
                  {isFrench ? "Voir" : "View"}
                </Link>
              )}
              <button
                type="button"
                className="secondary-button"
                onClick={() => window.open(toAbsoluteApiUrl(story.download_url), "_blank", "noopener")}
              >
                {isFrench ? "Télécharger" : "Download"}
              </button>
              <button type="button" className="danger-button" onClick={() => onDelete(story.id)}>
                {isFrench ? "Supprimer" : "Delete"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {isDesktop && selectedStory && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,17,22,0.56)",
            backdropFilter: "blur(10px)",
            zIndex: 70,
            display: "grid",
            placeItems: "center",
            padding: 24
          }}
        >
          <div
            className="surface-card"
            style={{
              width: "min(1120px, calc(100vw - 48px))",
              maxHeight: "calc(100vh - 48px)",
              overflow: "auto",
              padding: 24,
              display: "grid",
              gap: 18
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <button type="button" className="ghost-button" onClick={() => setSelectedStory(null)}>
                {isFrench ? "Fermer" : "Close"}
              </button>
            </div>
            <StoryDetailView
              locale={locale}
              initialStory={selectedStory}
              embedded
              onDeleted={() => {
                setStories((current) => current.filter((item) => item.id !== selectedStory.id));
                setSelectedStory(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
