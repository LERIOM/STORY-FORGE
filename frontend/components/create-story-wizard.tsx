"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ApiError,
  createStory,
  fetchJob,
  fetchProfile,
  fetchStory,
  getSpotifyLoginUrl,
  regenerateStoryImage,
  regenerateStoryMusic,
  toAbsoluteApiUrl
} from "@/lib/api";
import { GenerationMotion } from "@/components/generation-motion";
import { getMessages, type Locale } from "@/lib/i18n";
import type { JobStatus, ProfileData, StoryDetail } from "@/lib/types";


type UploadPreview = {
  id: string;
  file: File;
  previewUrl: string;
};

type CreateStoryWizardProps = {
  locale: Locale;
};


export function CreateStoryWizard({ locale }: CreateStoryWizardProps) {
  const copy = getMessages(locale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFrench = locale === "fr";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const [contextText, setContextText] = useState("");
  const [job, setJob] = useState<JobStatus | null>(null);
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const uploadsRef = useRef<UploadPreview[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchProfile()
      .then((payload) => {
        if (!cancelled) {
          setProfile(payload);
          setAuthChecked(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAuthChecked(true);
          if (err instanceof ApiError && err.status === 401) {
            setProfile(null);
            return;
          }
          setError(err instanceof Error ? err.message : "Unable to load session");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const storyId = searchParams.get("story");
    const jobId = searchParams.get("job");

    if (storyId && !story) {
      fetchStory(storyId)
        .then((payload) => {
          setStory(payload);
          setJob(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Unable to load story");
        });
    }

    if (jobId && !job && !story) {
      setJob({
        id: jobId,
        job_type: "create",
        status: "running",
        story_id: null,
        error_message: null,
        created_at: new Date().toISOString(),
        started_at: null,
        finished_at: null
      });
    }
  }, [job, searchParams, story]);

  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.status)) return;

    let cancelled = false;

    const pollJob = async (jobId: string) => {
      try {
        const payload = await fetchJob(jobId);
        if (cancelled) return;

        setJob(payload);
        if (payload.status === "succeeded" && payload.story_id) {
          const generatedStory = await fetchStory(payload.story_id);
          if (cancelled) return;

          setStory(generatedStory);
          startTransition(() => {
            router.replace(`${pathname}?story=${payload.story_id}`, { scroll: false });
          });
          setSubmitting(false);
        } else if (payload.status === "failed") {
          setError(payload.error_message ?? (isFrench ? "La génération a échoué." : "Generation failed."));
          setSubmitting(false);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to fetch job");
        setSubmitting(false);
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
  }, [isFrench, job, pathname, router]);

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    if (story) {
      setCurrentStep(3);
      return;
    }

    if (job && ["queued", "running"].includes(job.status)) {
      setCurrentStep(2);
    }
  }, [job, story]);

  useEffect(() => {
    return () => {
      uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  function updateQuery(params: URLSearchParams) {
    startTransition(() => {
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    });
  }

  function onSelectFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const incoming = Array.from(files);
    const availableSlots = 5 - uploads.length;
    if (availableSlots <= 0) {
      setError(isFrench ? "Maximum 5 images." : "Maximum 5 images.");
      return;
    }

    const nextItems = incoming.slice(0, availableSlots).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setUploads((current) => [...current, ...nextItems]);
  }

  function removeUpload(id: string) {
    setUploads((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function goToContextStep() {
    if (uploads.length < 1) {
      setError(isFrench ? "Ajoute au moins une image." : "Add at least one image.");
      return;
    }

    setError(null);
    setCurrentStep(1);
  }

  async function onGenerate() {
    if (uploads.length < 1) {
      setError(isFrench ? "Ajoute au moins une image." : "Add at least one image.");
      return;
    }

    if (!contextText.trim()) {
      setError(isFrench ? "Le contexte est requis." : "Context is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      uploads.forEach((item) => formData.append("images", item.file));
      formData.append("context", contextText.trim());
      formData.append("language", locale);

      const createdJob = await createStory(formData);
      setJob(createdJob);
      setStory(null);
      setCurrentStep(2);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("story");
      params.set("job", createdJob.id);
      updateQuery(params);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unable to start generation");
    }
  }

  async function onRegenerate(action: "image" | "music") {
    if (!story) return;

    setError(null);
    setSubmitting(true);

    try {
      const nextJob =
        action === "image" ? await regenerateStoryImage(story.id) : await regenerateStoryMusic(story.id);
      setJob(nextJob);
      setStory(null);
      setCurrentStep(2);

      const params = new URLSearchParams();
      params.set("job", nextJob.id);
      updateQuery(params);
    } catch (err) {
      setSubmitting(false);
      const message =
        err instanceof ApiError && err.status === 409
          ? isFrench
            ? "Les images sources ont expiré. La régénération d’image n’est plus disponible."
            : "Source images expired. Image regeneration is no longer available."
          : err instanceof Error
            ? err.message
            : "Unable to regenerate";
      setError(message);
    }
  }

  function resetWizard() {
    uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setUploads([]);
    setContextText("");
    setJob(null);
    setStory(null);
    setError(null);
    setSubmitting(false);
    setCurrentStep(0);
    updateQuery(new URLSearchParams());
  }

  if (!authChecked && !error) {
    return (
      <div className="empty-state">
        <strong>{isFrench ? "Vérification de la session…" : "Checking session…"}</strong>
      </div>
    );
  }

  if (authChecked && !error && !profile?.spotify.connected) {
    return (
      <section className="glass-panel" style={{ padding: "28px 24px", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "2rem" }}>
          {isFrench ? "Connecte Spotify pour démarrer." : "Connect Spotify to begin."}
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          {isFrench
            ? "La génération de story reste inaccessible tant que Spotify n’est pas connecté."
            : "Story generation stays unavailable until Spotify is connected."}
        </p>
        <a href={getSpotifyLoginUrl(locale, `/${locale}/create`)} className="primary-button">
          {copy.common.connectSpotify}
        </a>
      </section>
    );
  }

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div className="glass-panel" style={{ padding: "24px 20px", display: "grid", gap: 24 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>
            {copy.create.title}
          </h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {copy.create.steps.map((step, index) => {
              const active = index === currentStep;
              return (
                <span
                  key={step}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: active ? "var(--accent)" : "white",
                    color: active ? "white" : "var(--text-soft)",
                    border: "1px solid var(--line)",
                    fontWeight: 700
                  }}
                >
                  {index + 1}. {step}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gap: 24, paddingTop: 8 }}>
          {!story && !job && currentStep === 0 && (
            <>
              <div style={{ display: "grid", gap: 10 }}>
                <h2 style={{ margin: 0 }}>{copy.create.uploadTitle}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {isFrench ? "Entre 1 et 5 images, sans réorganisation." : "Between 1 and 5 images, no reordering."}
                </p>
              </div>

              {uploads.length === 0 ? (
                <label
                  style={{
                    display: "grid",
                    placeItems: "center",
                    gap: 10,
                    minHeight: 180,
                    border: "1px dashed rgba(22,21,21,0.2)",
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(255,255,255,0.72)",
                    cursor: "pointer",
                    padding: 20
                  }}
                >
                  <strong>{isFrench ? "Choisir des images" : "Select images"}</strong>
                  <span className="muted">{isFrench ? "JPG, PNG ou WEBP" : "JPG, PNG or WEBP"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(event) => onSelectFiles(event.target.files)}
                    style={{ display: "none" }}
                  />
                </label>
              ) : (
                <div
                  className="card-grid"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))"
                  }}
                >
                  {uploads.map((item) => (
                    <article key={item.id} className="surface-card" style={{ padding: 10, display: "grid", gap: 10 }}>
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 16 }}
                      />
                      <button type="button" className="ghost-button" onClick={() => removeUpload(item.id)}>
                        {isFrench ? "Retirer" : "Remove"}
                      </button>
                    </article>
                  ))}

                  <label
                    aria-label={isFrench ? "Ajouter une image" : "Add an image"}
                    style={{
                      minHeight: 190,
                      display: "grid",
                      placeItems: "center",
                      gap: 8,
                      borderRadius: "var(--radius-lg)",
                      border: "1px dashed rgba(22,21,21,0.2)",
                      background: "rgba(255,255,255,0.72)",
                      cursor: uploads.length >= 5 ? "not-allowed" : "pointer",
                      color: "var(--text-soft)",
                      padding: 18
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid var(--line)",
                        background: "white",
                        fontSize: "2rem",
                        lineHeight: 1,
                        color: "var(--accent)"
                      }}
                    >
                      +
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {uploads.length >= 5
                        ? isFrench
                          ? "Maximum atteint"
                          : "Maximum reached"
                        : isFrench
                          ? "Ajouter une image"
                          : "Add an image"}
                    </span>
                    <span className="muted" style={{ fontSize: "0.92rem", textAlign: "center" }}>
                      {isFrench ? `${uploads.length}/5 sélectionnées` : `${uploads.length}/5 selected`}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={(event) => onSelectFiles(event.target.files)}
                      disabled={uploads.length >= 5}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}

              {error && <p style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="primary-button" onClick={goToContextStep}>
                  {copy.common.continue}
                </button>
                <button type="button" className="secondary-button" onClick={resetWizard}>
                  {copy.create.startOver}
                </button>
              </div>
            </>
          )}

          {!story && !job && currentStep === 1 && (
            <>
              <div style={{ display: "grid", gap: 10 }}>
                <h2 style={{ margin: 0 }}>{copy.create.contextTitle}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {isFrench ? "Une phrase claire suffit." : "One clear sentence is enough."}
                </p>
              </div>

              <textarea
                value={contextText}
                onChange={(event) => setContextText(event.target.value)}
                rows={6}
                placeholder={copy.create.contextPlaceholder}
                style={{
                  width: "100%",
                  resize: "vertical",
                  borderRadius: 24,
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,0.8)",
                  padding: 18,
                  minHeight: 160,
                  outline: "none"
                }}
              />

              <div className="chip-row">
                {copy.create.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="chip"
                    onClick={() => setContextText((value) => (value ? `${value} ${suggestion}` : suggestion))}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {error && <p style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="ghost-button" onClick={() => setCurrentStep(0)}>
                  {isFrench ? "Retour aux images" : "Back to images"}
                </button>
                <button type="button" className="primary-button" onClick={onGenerate} disabled={submitting}>
                  {submitting ? copy.create.generating : copy.create.generate}
                </button>
                <button type="button" className="secondary-button" onClick={resetWizard}>
                  {copy.create.startOver}
                </button>
              </div>
            </>
          )}

          {job && !story && currentStep === 2 && (
            <>
              <div style={{ display: "grid", gap: 24, alignItems: "center" }}>
                <GenerationMotion />
                <p className="muted" style={{ margin: 0, textAlign: "center" }}>
                  {copy.create.generating}
                </p>
              </div>
              {error && <p style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}
            </>
          )}

          {story && currentStep === 3 && (
            <>
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
                  <div style={{ display: "grid", gap: 16 }}>
                    <p style={{ margin: 0, lineHeight: 1.7 }}>{story.context_text}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => window.open(toAbsoluteApiUrl(story.download_url), "_blank", "noopener")}
                      >
                        {copy.create.download}
                      </button>
                      <button type="button" className="secondary-button" onClick={() => onRegenerate("image")} disabled={submitting}>
                        {copy.create.regenerateImage}
                      </button>
                      <button type="button" className="secondary-button" onClick={() => onRegenerate("music")} disabled={submitting}>
                        {copy.create.regenerateMusic}
                      </button>
                      <button type="button" className="ghost-button" onClick={resetWizard}>
                        {copy.create.newStory}
                      </button>
                    </div>
                    {error && <p style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}
                  </div>

                  {story.track && (
                    <div style={{ display: "grid", gap: 16 }}>
                      {story.track.embed_url && (
                        <iframe
                          src={story.track.embed_url}
                          width="100%"
                          height="152"
                          loading="lazy"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          style={{ border: 0, borderRadius: 18 }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
