"use client";

import { useEffect } from "react";

const trackedPosts = new Set<string>();

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (trackedPosts.has(slug)) {
      return;
    }

    trackedPosts.add(slug);

    fetch(`/api/posts/${encodeURIComponent(slug)}/view`, {
      method: "POST",
    }).catch(() => {
      // 阅读量是附加数据，失败时不打断阅读体验。
    });
  }, [slug]);

  return null;
}
