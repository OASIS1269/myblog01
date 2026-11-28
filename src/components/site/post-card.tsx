import Link from "next/link";

import { formatDate } from "@/lib/utils";
import type { PostCard as PostCardType } from "@/types/post";

const coverGradients = [
  "bg-linear-to-br from-emerald-600 via-teal-700 to-stone-900",
  "bg-linear-to-br from-amber-500 via-orange-600 to-stone-900",
  "bg-linear-to-br from-sky-600 via-blue-700 to-stone-900",
];

type PostCardProps = {
  post: PostCardType;
  index?: number;
};

export function PostCard({ post, index = 0 }: PostCardProps) {
  const tags = post.tags.map(({ tag }) => tag);
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md">
      <Link
        href={`/posts/${post.slug}`}
        className="flex h-full flex-col focus-visible:outline-none"
      >
        {post.cover ? (
          <div className="aspect-video overflow-hidden bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div
            className={`flex aspect-video items-end p-5 ${
              coverGradients[index % coverGradients.length]
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">
              MyBlog · Note
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h2 className="mt-3 text-lg font-semibold leading-7 text-stone-900 transition-colors group-hover:text-emerald-800">
            {post.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
            {post.summary || "这篇文章还没有摘要，点击阅读全文。"}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-stone-500">
            <time dateTime={date.toISOString()}>{formatDate(date)}</time>
            <span>{post.views} 次阅读</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
