"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, fetchProfile, getSpotifyLoginUrl } from "@/lib/api";
import { getMessages, type Locale } from "@/lib/i18n";


type ConnectPanelProps = {
  locale: Locale;
};


export function ConnectPanel({ locale }: ConnectPanelProps) {
  const copy = getMessages(locale);
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchProfile()
      .then((payload) => {
        if (!cancelled) {
          if (payload.spotify.connected) {
            router.replace(`/${locale}/create`);
            return;
          }
          setSessionChecked(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (!(err instanceof ApiError && err.status === 401)) {
            console.error(err);
          }
          setSessionChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  if (!sessionChecked) {
    return (
      <div className="empty-state">
        <strong>{locale === "fr" ? "Vérification de la session…" : "Checking session…"}</strong>
      </div>
    );
  }

  return (
    <section
      className="glass-panel"
      style={{
        padding: "40px 24px",
        display: "grid",
        gap: 20,
        maxWidth: 760,
        margin: "0 auto"
      }}
    >
      <h1 className="section-title" style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}>
        {copy.connect.title}
      </h1>
      <p className="muted" style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6 }}>
        {copy.connect.body}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href={getSpotifyLoginUrl(locale, `/${locale}/create`)}
          className="primary-button"
        >
          {copy.connect.button}
        </a>
        <a href={`/${locale}`} className="secondary-button">
          {locale === "fr" ? "Retour" : "Back"}
        </a>
      </div>
    </section>
  );
}
