import { createHash, randomUUID } from "node:crypto";

export function normalizeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildPostSlug(title: string, provided?: string): string {
  const desired = normalizeSlug(provided ?? "");

  if (desired) {
    return desired;
  }

  const fromTitle = normalizeSlug(title);

  if (fromTitle) {
    return fromTitle;
  }

  return `post-${randomUUID().slice(0, 8)}`;
}

export function buildTagSlug(name: string): string {
  const base = normalizeSlug(name);

  if (base) {
    return base;
  }

  return `tag-${createHash("sha1").update(name).digest("hex").slice(0, 10)}`;
}
