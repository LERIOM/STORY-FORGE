export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export const DEFAULT_LOCALE = "fr";
export const LOCALE_COOKIE = "storyforge-locale";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

type Messages = {
  common: {
    create: string;
    stories: string;
    profile: string;
    connectSpotify: string;
    continue: string;
    openSpotify: string;
    loading: string;
  };
  landing: {
    title: string;
    subtitle: string;
    cta: string;
    howItWorks: string[];
  };
  connect: {
    title: string;
    body: string;
    button: string;
  };
  create: {
    title: string;
    subtitle: string;
    steps: string[];
    uploadTitle: string;
    contextTitle: string;
    generateTitle: string;
    resultTitle: string;
    contextPlaceholder: string;
    suggestions: string[];
    generate: string;
    generating: string;
    startOver: string;
    download: string;
    regenerateImage: string;
    regenerateMusic: string;
    newStory: string;
  };
  stories: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    view: string;
    download: string;
    delete: string;
  };
  profile: {
    title: string;
    subtitle: string;
    spotifyConnected: string;
    reconnect: string;
    logout: string;
    empty: string;
  };
};

export const messages: Record<Locale, Messages> = {
  fr: {
    common: {
      create: "Créer",
      stories: "Mes stories",
      profile: "Profil",
      connectSpotify: "Connecter Spotify",
      continue: "Continuer",
      openSpotify: "Ouvrir dans Spotify",
      loading: "Chargement"
    },
    landing: {
      title: "Transforme tes images et une intention en story prête à partager.",
      subtitle:
        "Story Forge assemble tes images, ton contexte et une suggestion musicale Spotify dans une expérience claire, rapide et pensée d’abord pour le téléphone.",
      cta: "Commencer",
      howItWorks: [
        "Ajoute entre 1 et 5 images.",
        "Décris l’intention ou le moment à raconter.",
        "Obtiens une story verticale et une musique cohérente."
      ]
    },
    connect: {
      title: "Spotify est nécessaire pour personnaliser la musique.",
      body: "Nous utilisons Spotify pour choisir une piste cohérente avec ton contexte et tes habitudes d’écoute. La musique reste affichée sur le site, jamais exportée dans le PNG.",
      button: "Continuer avec Spotify"
    },
    create: {
      title: "Créer une nouvelle story",
      subtitle: "Un parcours simple, rapide et pensé pour mobile.",
      steps: ["Images", "Contexte", "Génération", "Résultat"],
      uploadTitle: "Ajoute tes images",
      contextTitle: "Décris l’intention",
      generateTitle: "Création en cours",
      resultTitle: "Story générée",
      contextPlaceholder: "Exemple : Je veux une story pour souhaiter un joyeux anniversaire à cette personne.",
      suggestions: ["Anniversaire", "Souvenir", "Sortie entre amis"],
      generate: "Générer ma story",
      generating: "La story se construit en ce moment.",
      startOver: "Repartir de zéro",
      download: "Télécharger la story",
      regenerateImage: "Régénérer l’image",
      regenerateMusic: "Changer la musique",
      newStory: "Créer une nouvelle story"
    },
    stories: {
      title: "Mes stories",
      subtitle: "Retrouve tes créations les plus récentes dans une galerie privée.",
      emptyTitle: "Aucune story pour le moment",
      emptyBody: "Dès qu’une génération est terminée, elle apparaît ici.",
      view: "Voir",
      download: "Télécharger",
      delete: "Supprimer"
    },
    profile: {
      title: "Profil",
      subtitle: "Compte, Spotify et préférences d’interface.",
      spotifyConnected: "Spotify connecté",
      reconnect: "Reconnecter Spotify",
      logout: "Se déconnecter",
      empty: "Connecte Spotify pour activer la génération."
    }
  },
  en: {
    common: {
      create: "Create",
      stories: "My stories",
      profile: "Profile",
      connectSpotify: "Connect Spotify",
      continue: "Continue",
      openSpotify: "Open in Spotify",
      loading: "Loading"
    },
    landing: {
      title: "Turn your images and intent into a polished story.",
      subtitle:
        "Story Forge combines your images, written context and Spotify taste into a clean, fast workflow built for phones first.",
      cta: "Get started",
      howItWorks: [
        "Upload between 1 and 5 images.",
        "Describe the mood, moment or purpose.",
        "Get one vertical story and a fitting Spotify track."
      ]
    },
    connect: {
      title: "Spotify is required to personalize the music choice.",
      body: "We use Spotify to pick a track that fits your context and listening habits. The music stays visible on the site and is never embedded in the exported PNG.",
      button: "Continue with Spotify"
    },
    create: {
      title: "Create a new story",
      subtitle: "A clear, quick workflow designed for mobile first.",
      steps: ["Images", "Context", "Generation", "Result"],
      uploadTitle: "Add your images",
      contextTitle: "Describe the intent",
      generateTitle: "Generating your story",
      resultTitle: "Generated story",
      contextPlaceholder: "Example: I want a story that celebrates this person’s birthday.",
      suggestions: ["Birthday", "Memory", "Night out"],
      generate: "Generate my story",
      generating: "Your story is being assembled right now.",
      startOver: "Start over",
      download: "Download story",
      regenerateImage: "Regenerate image",
      regenerateMusic: "Change music",
      newStory: "Create a new story"
    },
    stories: {
      title: "My stories",
      subtitle: "Find your most recent creations in a private gallery.",
      emptyTitle: "No stories yet",
      emptyBody: "Finished generations will appear here.",
      view: "View",
      download: "Download",
      delete: "Delete"
    },
    profile: {
      title: "Profile",
      subtitle: "Account, Spotify connection and interface preferences.",
      spotifyConnected: "Spotify connected",
      reconnect: "Reconnect Spotify",
      logout: "Log out",
      empty: "Connect Spotify to enable generation."
    }
  }
};

export function resolveLocale(value: string): Locale {
  return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

export function getMessages(locale: string) {
  return messages[resolveLocale(locale)];
}
