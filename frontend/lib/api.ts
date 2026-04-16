import type { JobStatus, ProfileData, StoryDetail, StorySummary } from "@/lib/types";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const LOCAL_PLACEHOLDER_HOSTS = new Set(["127.0.0.1", "localhost", "0.0.0.0"]);

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL);

  if (typeof window === "undefined") {
    return configuredBaseUrl;
  }

  const parsedBaseUrl = new URL(configuredBaseUrl);
  if (!LOCAL_PLACEHOLDER_HOSTS.has(parsedBaseUrl.hostname)) {
    return configuredBaseUrl;
  }

  const apiPath = trimTrailingSlash(parsedBaseUrl.pathname);
  if (!LOCAL_PLACEHOLDER_HOSTS.has(window.location.hostname)) {
    return `${window.location.origin}${apiPath}`;
  }

  const apiPort = parsedBaseUrl.port || "8000";
  return `${window.location.protocol}//${window.location.hostname}:${apiPort}${apiPath}`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function normalizePath(path: string) {
  const apiBaseUrl = resolveApiBaseUrl();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${apiBaseUrl}${path.replace("/api/v1", "")}`;
  }

  return `${apiBaseUrl}/${path}`;
}

export function toAbsoluteApiUrl(path: string) {
  const apiBaseUrl = resolveApiBaseUrl();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/api/v1")) {
    return `${apiBaseUrl}${path.slice("/api/v1".length)}`;
  }

  if (path.startsWith("/")) {
    return `${apiBaseUrl}${path}`;
  }

  return `${apiBaseUrl}/${path}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(normalizePath(path), {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {})
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.detail ?? payload?.message ?? "Unexpected API error";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export function getSpotifyLoginUrl(locale: string, returnTo: string) {
  const url = new URL(toAbsoluteApiUrl("/auth/spotify/login"));
  url.searchParams.set("return_to", returnTo.startsWith("/") ? returnTo : `/${locale}/create`);
  return url.toString();
}

export async function fetchProfile() {
  return apiFetch<ProfileData>("/me");
}

export async function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export async function fetchStories() {
  return apiFetch<StorySummary[]>("/stories");
}

export async function fetchStory(storyId: string) {
  return apiFetch<StoryDetail>(`/stories/${storyId}`);
}

export async function fetchJob(jobId: string) {
  return apiFetch<JobStatus>(`/jobs/${jobId}`);
}

export async function createStory(formData: FormData) {
  return apiFetch<JobStatus>("/stories", {
    method: "POST",
    body: formData
  });
}

export async function regenerateStoryImage(storyId: string) {
  return apiFetch<JobStatus>(`/stories/${storyId}/regenerate-image`, {
    method: "POST"
  });
}

export async function regenerateStoryMusic(storyId: string) {
  return apiFetch<JobStatus>(`/stories/${storyId}/regenerate-music`, {
    method: "POST"
  });
}

export async function deleteStory(storyId: string) {
  return apiFetch<void>(`/stories/${storyId}`, {
    method: "DELETE"
  });
}
