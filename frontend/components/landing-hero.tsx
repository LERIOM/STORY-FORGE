"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ApiError, fetchProfile } from "@/lib/api";
import { StoryPreview } from "@/components/story-preview";
import { getMessages, type Locale } from "@/lib/i18n";
import type { ProfileData } from "@/lib/types";


type LandingHeroProps = {
  locale: Locale;
};


export function LandingHero({ locale }: LandingHeroProps) {
  const copy = getMessages(locale);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const isConnected = Boolean(profile?.spotify.connected);

  useEffect(() => {
    let cancelled = false;

    fetchProfile()
      .then((payload) => {
        if (!cancelled) {
          setProfile(payload);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (!(err instanceof ApiError && err.status === 401)) {
            console.error(err);
          }
          setProfile(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="landing-hero">
      <div className="glass-panel landing-intro-card">
        <h1 className="section-title">{copy.landing.title}</h1>
        <p className="muted landing-intro-copy">{copy.landing.subtitle}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {isConnected ? (
            <>
              <Link href={`/${locale}/create`} className="primary-button">
                {locale === "fr" ? "Créer une story" : "Create a story"}
              </Link>
              <Link href={`/${locale}/stories`} className="secondary-button">
                {locale === "fr" ? "Voir la bibliothèque" : "Browse the library"}
              </Link>
            </>
          ) : (
            <Link href={`/${locale}/connect`} className="primary-button">
              {copy.landing.cta}
            </Link>
          )}
        </div>
      </div>

      <div className="landing-showcase">
        <div className="landing-story-column">
          <StoryPreview locale={locale} />
        </div>

        <div className="landing-step-stack">
        {copy.landing.howItWorks.map((step, index) => (
          <article key={step} className="surface-card landing-step-card">
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                display: "inline-grid",
                placeItems: "center",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                fontWeight: 800
              }}
            >
              0{index + 1}
            </span>
            <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.5 }}>{step}</p>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}
