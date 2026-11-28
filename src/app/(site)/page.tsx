import Link from "next/link";

import { PostCard } from "@/components/site/post-card";
import { Pagination } from "@/components/ui/pagination";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";
import { siteConfig } from "@/config/site";
import { parsePageParam } from "@/lib/validation";
import { listPublishedPosts } from "@/server/services/posts";

type HomePageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const result = await listPublishedPosts(page);

  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
            <span className="h-px w-8 bg-emerald-600" aria-hidden="true" />
            MyBlog · Personal Notes
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#posts" className={buttonPrimary}>
              开始阅读
            </a>
            <Link href="/about" className={buttonSecondary}>
              关于我
            </Link>
          </div>
        </div>
      </section>

      <section
        id="posts"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              最新文章
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              共 {result.total} 篇文章
            </p>
          </div>
          <Link
            href="/about"
            className="hidden text-sm font-medium text-stone-500 transition-colors hover:text-emerald-700 sm:inline-flex"
          >
            了解更多 →
          </Link>
        </div>

        {result.posts.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-stone-700">暂无文章</p>
            <p className="mt-2 text-sm text-stone-500">
              等博主写下第一篇内容，这里就会热闹起来。
            </p>
          </div>
        )}

        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          basePath="/"
        />
      </section>
    </>
  );
}
