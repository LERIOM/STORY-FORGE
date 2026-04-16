"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchProfile, getSpotifyLoginUrl, logout } from "@/lib/api";
import type { Locale } from "@/lib/i18n";
import type { ProfileData } from "@/lib/types";


type ProfilePanelProps = {
  locale: Locale;
};


export function ProfilePanel({ locale }: ProfilePanelProps) {
  const isFrench = locale === "fr";
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

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
          setError(err instanceof Error ? err.message : "Unable to load profile");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push(`/${locale}`);
      router.refresh();
    } catch (err) {
      setLoggingOut(false);
      setError(err instanceof Error ? err.message : "Unable to log out");
    }
  }

  if (error && !profile) {
    return <div className="empty-state"><strong>{error}</strong></div>;
  }

  if (!profile) {
    return <div className="empty-state"><strong>{isFrench ? "Chargement du profil…" : "Loading profile…"}</strong></div>;
  }

  return (
    <section
      style={{
        display: "grid",
        gap: 20,
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
      }}
    >
      <article className="surface-card" style={{ padding: 22, display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? "Profile"}
              style={{ width: 92, height: 92, borderRadius: 28, objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: 92, height: 92, borderRadius: 28, background: "var(--surface-muted)" }} />
          )}
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ fontSize: "1.2rem" }}>{profile.display_name ?? "Spotify user"}</strong>
            <span className="muted">{profile.email ?? (isFrench ? "Email non communiqué" : "No email available")}</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1rem" }}>
            {profile.spotify.connected ? (isFrench ? "Spotify connecté" : "Spotify connected") : "Spotify disconnected"}
          </span>
          <span className="muted">
            {profile.spotify.product
              ? `${isFrench ? "Offre" : "Plan"}: ${profile.spotify.product}`
              : isFrench
                ? "Produit Spotify non disponible"
                : "Spotify plan unavailable"}
          </span>
        </div>
      </article>

      <article className="surface-card" style={{ padding: 22, display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={{ margin: 0 }}>{isFrench ? "Connexion Spotify" : "Spotify connection"}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {isFrench
              ? "Reconnecte Spotify si tu veux changer de compte ou renouveler les autorisations."
              : "Reconnect Spotify if you want to switch accounts or renew permissions."}
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a href={getSpotifyLoginUrl(locale, `/${locale}/profile`)} className="primary-button">
            {isFrench ? "Reconnecter ou changer le compte" : "Reconnect or switch account"}
          </a>
          <button type="button" className="secondary-button" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? (isFrench ? "Déconnexion…" : "Logging out…") : isFrench ? "Se déconnecter" : "Log out"}
          </button>
        </div>
      </article>
    </section>
  );
}
