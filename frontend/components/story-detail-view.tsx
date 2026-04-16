"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ApiError,
  deleteStory,
  fetchJob,
  fetchStory,
  regenerateStoryImage,
  regenerateStoryMusic,
  toAbsoluteApiUrl
} from "@/lib/api";
import { formatStoryDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { JobStatus, StoryDetail } from "@/lib/types";


type StoryDetailViewProps = {
  locale: Locale;
  storyId?: string;
  initialStory?: StoryDetail;
  embedded?: boolean;
  onDeleted?: () => void;
};


export function StoryDetailView({
  locale,
  storyId,
  initialStory,
  embedded = false,
  onDeleted
}: StoryDetailViewProps) {
  const router = useRouter();
  const [story, setStory] = useState<StoryDetail | null>(initialStory ?? null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"image" | "music" | "delete" | null>(null);

  const activeStoryId = story?.id ?? storyId ?? "";
  const isFrench = locale === "fr";

  useEffect(() => {
    if (!storyId || initialStory) {
      return;
    }

    let cancelled = false;
    fetchStory(storyId)
      .then((payload) => {
        if (!cancelled) {
          setStory(payload);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load story");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialStory, storyId]);

  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.status)) {
      return;
    }

    let cancelled = false;
    const pollJob = async (jobId: string) => {
      try {
        const payload = await fetchJob(jobId);
        if (cancelled) return;

        setJob(payload);
        if (payload.status === "succeeded" && payload.story_id) {
          const refreshed = await fetchStory(payload.story_id);
          if (cancelled) return;

          setStory(refreshed);
          setBusyAction(null);
        }
        if (payload.status === "failed") {
          setError(payload.error_message ?? (isFrench ? "La génération a échoué." : "Generation failed."));
          setBusyAction(null);
        }
      } catch (err) {
        if (cancelled) return;
        setBusyAction(null);
        setError(err instanceof Error ? err.message : "Unable to refresh job");
      }
    };

    const timer = window.setInterval(() => {
      void pollJob(job.id);
    }, 2200);

    void pollJob(job.id);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isFrench, job]);

  const trackEmbed = useMemo(() => story?.track?.embed_url ?? null, [story?.track?.embed_url]);

  async function onRegenerateImage() {
    if (!activeStoryId) return;
    setError(null);
    setBusyAction("image");
    try {
      const payload = await regenerateStoryImage(activeStoryId);
      setJob(payload);
    } catch (err) {
      setBusyAction(null);
      const message =
        err instanceof ApiError && err.status === 409
          ? isFrench
            ? "Les images sources ont expiré. La régénération de l’image n’est plus disponible."
            : "Source images have expired. Image regeneration is no longer available."
          : err instanceof Error
            ? err.message
            : "Unable to regenerate image";
      setError(message);
    }
  }

  async function onRegenerateMusic() {
    if (!activeStoryId) return;
    setError(null);
    setBusyAction("music");
    try {
      const payload = await regenerateStoryMusic(activeStoryId);
      setJob(payload);
    } catch (err) {
      setBusyAction(null);
      setError(err instanceof Error ? err.message : "Unable to regenerate music");
    }
  }

  async function onDelete() {
    if (!activeStoryId) return;
    const confirmed = window.confirm(
      isFrench ? "Supprimer cette story de la bibliothèque ?" : "Delete this story from the library?"
    );
    if (!confirmed) return;

    setBusyAction("delete");
    try {
      await deleteStory(activeStoryId);
      if (onDeleted) {
        onDeleted();
        return;
      }
      router.push(`/${locale}/stories`);
      router.refresh();
    } catch (err) {
      setBusyAction(null);
      setError(err instanceof Error ? err.message : "Unable to delete story");
    }
  }

  if (error && !story) {
    return (
      <div className="empty-state">
        <strong>{error}</strong>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="empty-state">
        <strong>{isFrench ? "Chargement de la story…" : "Loading story…"}</strong>
      </div>
    );
  }

  return (
    <section
      className={embedded ? "" : "glass-panel"}
      style={{
        padding: embedded ? 0 : "24px",
        display: "grid",
        gap: 20
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: embedded ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "start"
        }}
      >
        <div className="story-frame">
          <img
            src={toAbsoluteApiUrl(story.image_url)}
            alt={story.context_text}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div className="stack">
          {story.track && (
            <div className="surface-card" style={{ padding: 20, display: "grid", gap: 18 }}>
              {trackEmbed && (
                <iframe
                  src={trackEmbed}
                  width="100%"
                  height="152"
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  style={{ border: 0, borderRadius: 18 }}
                />
              )}
            </div>
          )}

          <div className="surface-card" style={{ padding: 20, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <span className="muted" style={{ fontSize: "0.95rem" }}>{formatStoryDate(story.created_at, locale)}</span>
              {story.source_story_id && (
                <span style={{ color: "var(--accent)", fontSize: "0.95rem", fontWeight: 600 }}>
                  {isFrench ? "Variante" : "Variant"}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.7 }}>{story.context_text}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => window.open(toAbsoluteApiUrl(story.download_url), "_blank", "noopener")}
              >
                {isFrench ? "Télécharger la story" : "Download story"}
              </button>
              <button type="button" className="secondary-button" onClick={onRegenerateImage} disabled={busyAction !== null}>
                {busyAction === "image"
                  ? isFrench
                    ? "Régénération image…"
                    : "Regenerating image…"
                  : isFrench
                    ? "Régénérer l’image"
                    : "Regenerate image"}
              </button>
              <button type="button" className="secondary-button" onClick={onRegenerateMusic} disabled={busyAction !== null}>
                {busyAction === "music"
                  ? isFrench
                    ? "Mise à jour musique…"
                    : "Refreshing music…"
                  : isFrench
                    ? "Changer la musique"
                    : "Change music"}
              </button>
              <button type="button" className="danger-button" onClick={onDelete} disabled={busyAction !== null}>
                {busyAction === "delete" ? (isFrench ? "Suppression…" : "Deleting…") : isFrench ? "Supprimer" : "Delete"}
              </button>
            </div>
            {error && <p style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}
            {job && ["queued", "running"].includes(job.status) && (
              <p style={{ margin: 0, color: "var(--accent)" }}>
                {isFrench ? "Nouvelle génération en cours…" : "A new generation is running…"}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
