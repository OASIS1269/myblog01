import type { Metadata } from "next";
import Link from "next/link";

import { DeletePostButton } from "@/components/admin/delete-post-button";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  buttonPrimary,
  buttonSecondary,
  cardClass,
  inputClass,
  tableActionClass,
} from "@/components/ui/styles";
import { formatDateTime, getFirstString } from "@/lib/utils";
import {
  parsePageParam,
  parseStatusParam,
} from "@/lib/validation";
import { listAdminPosts } from "@/server/services/posts";

export const metadata: Metadata = {
  title: "文章管理",
};

type PostsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
    notice?: string | string[];
  }>;
};

const noticeMessages: Record<string, string> = {
  created: "文章创建成功。",
  updated: "文章更新成功。",
  deleted: "文章已删除。",
};

export default async function AdminPostsPage({
  searchParams,
}: PostsPageProps) {
  const params = await searchParams;
  const q = (getFirstString(params.q) ?? "").trim().slice(0, 100);
  const status = parseStatusParam(params.status);
  const page = parsePageParam(params.page);
  const notice = getFirstString(params.notice);

  const result = await listAdminPosts({ q, status, page });
  const noticeMessage = notice ? noticeMessages[notice] : undefined;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            内容
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-950">
            文章管理
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            共 {result.total} 篇文章，支持搜索、筛选与分页。
          </p>
        </div>
        <Link href="/admin/posts/new" className={buttonPrimary}>
          + 新增文章
        </Link>
      </div>

      {noticeMessage && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {noticeMessage}
        </div>
      )}

      <form
        method="get"
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <label htmlFor="q" className="sr-only">
          搜索标题
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="搜索文章标题…"
          className={`${inputClass} sm:max-w-xs`}
        />

        <label htmlFor="status" className="sr-only">
          状态筛选
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ""}
          className={`${inputClass} sm:w-36`}
        >
          <option value="">全部状态</option>
          <option value="PUBLISHED">已发布</option>
          <option value="DRAFT">草稿</option>
        </select>

        <button type="submit" className={buttonSecondary}>
          筛选
        </button>

        {(q || status) && (
          <Link
            href="/admin/posts"
            className="inline-flex h-11 items-center px-2 text-sm font-medium text-stone-500 transition-colors hover:text-emerald-700"
          >
            重置
          </Link>
        )}
      </form>

      {result.posts.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-left">
                <thead className="bg-stone-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      文章
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      状态
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      标签
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      更新时间
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      阅读
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {result.posts.map((post) => (
                    <tr key={post.id} className="align-top">
                      <td className="max-w-xs px-5 py-4">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="line-clamp-2 text-sm font-medium text-stone-800 transition-colors hover:text-emerald-700"
                        >
                          {post.title}
                        </Link>
                        <p className="mt-1 truncate font-mono text-[11px] text-stone-400">
                          /posts/{post.slug}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-40 flex-wrap gap-1.5">
                          {post.tags.length > 0 ? (
                            post.tags.slice(0, 2).map(({ tag }) => (
                              <span
                                key={tag.id}
                                className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600"
                              >
                                {tag.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                          {post.tags.length > 2 && (
                            <span className="text-[11px] text-stone-400">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-stone-500">
                        {formatDateTime(post.updatedAt)}
                      </td>
                      <td className="px-4 py-4 text-xs text-stone-500">
                        {post.views}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {post.status === "PUBLISHED" && (
                            <Link
                              href={`/posts/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={tableActionClass}
                            >
                              查看
                            </Link>
                          )}
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className={tableActionClass}
                          >
                            编辑
                          </Link>
                          <DeletePostButton
                            id={post.id}
                            title={post.title}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {result.posts.map((post) => (
              <article key={post.id} className={`${cardClass} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-sm font-semibold leading-6 text-stone-800"
                  >
                    {post.title}
                  </Link>
                  <StatusBadge status={post.status} />
                </div>
                <p className="mt-1 truncate font-mono text-[11px] text-stone-400">
                  /posts/{post.slug}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                  <span>{formatDateTime(post.updatedAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.views} 次阅读</span>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3">
                  {post.status === "PUBLISHED" && (
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${tableActionClass} inline-flex min-h-11 items-center px-2`}
                    >
                      查看
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className={`${tableActionClass} inline-flex min-h-11 items-center px-2`}
                  >
                    编辑
                  </Link>
                  <DeletePostButton id={post.id} title={post.title} />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-base font-medium text-stone-700">
            {q || status ? "没有找到符合条件的文章" : "还没有文章"}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            {q || status
              ? "试试调整搜索关键词或状态筛选。"
              : "点击「新增文章」开始写第一篇内容。"}
          </p>
          <Link
            href="/admin/posts/new"
            className={`${buttonPrimary} mt-6`}
          >
            新建文章
          </Link>
        </div>
      )}

      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        basePath="/admin/posts"
        query={{
          q: q || undefined,
          status,
        }}
      />
    </div>
  );
}
