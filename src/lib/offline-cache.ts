// Simple localStorage cache for offline lesson reading
const KEY = "jewel-offline-courses-v1";

type CachedCourse = {
  slug: string;
  cachedAt: number;
  data: unknown;
};

function readAll(): Record<string, CachedCourse> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}

export function cacheCourse(slug: string, data: unknown) {
  const all = readAll();
  all[slug] = { slug, cachedAt: Date.now(), data };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* quota */ }
}

export function getCachedCourse<T = unknown>(slug: string): T | null {
  const all = readAll();
  return (all[slug]?.data as T) ?? null;
}

export function listCachedSlugs(): string[] {
  return Object.keys(readAll());
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
