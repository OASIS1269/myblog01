import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TableOfContents } from "@/components/site/toc";
import { ViewTracker } from "@/components/site/view-tracker";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { siteConfig } from "@/config/site";
import {
  deriveSummary,
  formatDate,
  getReadingTime,
} from "@/lib/utils";
import {
  getAdjacentPosts,
  getPublishedPostBySlug,
} from "@/server/services/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: "文章不存在" };
  }

  const description = post.summary || deriveSummary(post.content, 150);

  return {
    title: post.title,
    description,
    keywords: post.tags.map(({ tag }) => tag.name),
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags.map(({ tag }) => tag.name),
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [adjacent, tags] = await Promise.all([
    getAdjacentPosts(post),
    Promise.resolve(post.tags.map(({ tag }) => tag)),
  ]);

  const publishedAt = post.publishedAt ?? post.createdAt;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <ViewTracker slug={post.slug} />

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-emerald-700"
      >
        <span aria-hidden="true">←</span>
        返回首页
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        <article className="min-w-0">
          <header className="border-b border-stone-200 pb-8">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-stone-950 sm:text-4xl">
              {post.title}
            </h1>

            {post.summary && (
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
                {post.summary}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
              <span>{siteConfig.author.name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={publishedAt.toISOString()}>
                {formatDate(publishedAt)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{getReadingTime(post.content)} 分钟阅读</span>
              <span aria-hidden="true">·</span>
              <span>{post.views} 次阅读</span>
            </div>
          </header>

          {post.cover && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          <div className="mt-8">
            <MarkdownContent content={post.content} />
          </div>

          {tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-6">
              <span className="text-sm font-medium text-stone-500">标签</span>
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {(adjacent.previous || adjacent.next) && (
            <nav
              aria-label="文章导航"
              className="mt-12 grid gap-4 sm:grid-cols-2"
            >
              {adjacent.previous ? (
                <Link
                  href={`/posts/${adjacent.previous.slug}`}
                  className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:shadow-sm"
                >
                  <span className="text-xs font-medium text-stone-400">
                    ← 上一篇
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-stone-800 group-hover:text-emerald-800">
                    {adjacent.previous.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {adjacent.next ? (
                <Link
                  href={`/posts/${adjacent.next.slug}`}
                  className="group rounded-2xl border border-stone-200 bg-white p-5 text-right transition hover:border-stone-300 hover:shadow-sm sm:col-start-2"
                >
                  <span className="text-xs font-medium text-stone-400">
                    下一篇 →
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-stone-800 group-hover:text-emerald-800">
                    {adjacent.next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents content={post.content} />
          </div>
        </aside>
      </div>
    </div>
  );
}
