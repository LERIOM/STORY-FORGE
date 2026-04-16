export type SpotifyConnectionState = {
  connected: boolean;
  spotify_user_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  product: string | null;
  updated_at: string | null;
};

export type ProfileData = {
  id: string;
  display_name: string | null;
  email: string | null;
  locale: string;
  avatar_url: string | null;
  spotify: SpotifyConnectionState;
};

export type SpotifyTrack = {
  id: string | null;
  name: string | null;
  artist: string | null;
  external_url: string | null;
  embed_url: string | null;
  album_art_url: string | null;
};

export type StorySummary = {
  id: string;
  status: string;
  language: string;
  context_text: string;
  created_at: string;
  image_url: string;
  download_url: string;
  source_story_id: string | null;
  track: SpotifyTrack | null;
};

export type StoryDetail = StorySummary & {
  updated_at: string;
  source_retention_until: string | null;
};

export type JobStatus = {
  id: string;
  story_id: string | null;
  job_type: string;
  status: "queued" | "running" | "succeeded" | "failed" | string;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

