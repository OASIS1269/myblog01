import Link from "next/link";

import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  query: PaginationProps["query"],
  page: number,
): string {
  const params = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params.set(key, value);
      }
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

function getPageItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: Array<number | "ellipsis"> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  query,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPageItems(currentPage, totalPages);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      aria-label="分页"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(basePath, query, previousPage)}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          上一页
        </Link>
      ) : (
        <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 px-3 text-sm text-stone-400">
          上一页
        </span>
      )}

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-11 min-w-11 items-center justify-center text-sm text-stone-400"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(basePath, query, item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
              item === currentPage
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(basePath, query, nextPage)}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          下一页
        </Link>
      ) : (
        <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 px-3 text-sm text-stone-400">
          下一页
        </span>
      )}
    </nav>
  );
}
