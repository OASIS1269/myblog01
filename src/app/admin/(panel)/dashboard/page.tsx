import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import { cardClass } from "@/components/ui/styles";
import { formatDateTime } from "@/lib/utils";
import { getDashboardStats } from "@/server/services/posts";

export const metadata: Metadata = {
  title: "仪表盘",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "文章总数",
      value: stats.total,
      hint: "全部文章",
      dot: "bg-stone-900",
    },
    {
      label: "已发布",
      value: stats.published,
      hint: "前台可见",
      dot: "bg-emerald-600",
    },
    {
      label: "草稿",
      value: stats.draft,
      hint: "仅后台可见",
      dot: "bg-amber-500",
    },
    {
      label: "总阅读量",
      value: stats.views,
      hint: "所有文章累计",
      dot: "bg-sky-600",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            概览
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-950">
            仪表盘
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            快速了解博客的文章与阅读情况。
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          + 写文章
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-stone-500">{card.label}</p>
              <span
                className={`h-2.5 w-2.5 rounded-full ${card.dot}`}
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-stone-400">{card.hint}</p>
          </div>
        ))}
      </div>

      <section className={`${cardClass} mt-6 overflow-hidden`}>
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-stone-900">
            最近更新
          </h2>
          <Link
            href="/admin/posts"
            className="text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800"
          >
            全部文章 →
          </Link>
        </div>

        {stats.recent.length > 0 ? (
          <ul className="divide-y divide-stone-100">
            {stats.recent.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="truncate text-sm font-medium text-stone-800 transition-colors hover:text-emerald-700"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs text-stone-400">
                    更新于 {formatDateTime(post.updatedAt)}
                  </p>
                </div>
                <StatusBadge status={post.status} />
                {post.status === "PUBLISHED" && (
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-stone-500 transition-colors hover:text-emerald-700"
                  >
                    查看 ↗
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-stone-700">还没有文章</p>
            <p className="mt-1 text-xs text-stone-500">
              写一篇文章，让这里开始有内容。
            </p>
            <Link
              href="/admin/posts/new"
              className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              新建第一篇文章 →
            </Link>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/posts/new"
          className={`${cardClass} p-5 transition hover:border-stone-300 hover:shadow-md`}
        >
          <p className="text-sm font-semibold text-stone-900">写一篇文章</p>
          <p className="mt-1 text-xs text-stone-500">
            支持 Markdown，保存草稿或直接发布。
          </p>
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${cardClass} p-5 transition hover:border-stone-300 hover:shadow-md`}
        >
          <p className="text-sm font-semibold text-stone-900">查看博客前台</p>
          <p className="mt-1 text-xs text-stone-500">
            在新窗口打开用户端首页。
          </p>
        </Link>
      </div>
    </div>
  );
}
