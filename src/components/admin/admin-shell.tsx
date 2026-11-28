"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";

type AdminShellProps = {
  username: string;
  children: ReactNode;
};

const navItems = [
  {
    href: "/admin/dashboard",
    label: "仪表盘",
    description: "文章统计与最近更新",
  },
  {
    href: "/admin/posts",
    label: "文章管理",
    description: "查看、编辑与发布文章",
  },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.includes("/posts/new")) {
    return "新建文章";
  }

  if (pathname.includes("/edit")) {
    return "编辑文章";
  }

  if (pathname.startsWith("/admin/posts")) {
    return "文章管理";
  }

  return "仪表盘";
}

export function AdminShell({ username, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string) {
    return href === "/admin/dashboard"
      ? pathname === href
      : pathname.startsWith(href);
  }

  return (
    <div className="min-h-dvh bg-stone-100 text-stone-900">
      {open && (
        <button
          type="button"
          aria-label="关闭菜单"
          className="fixed inset-0 z-40 bg-stone-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-stone-200 px-5">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-sm font-semibold text-white">
              M
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-stone-900">
                {siteConfig.brand}
              </span>
              <span className="mt-1 text-[11px] text-stone-400">
                管理后台
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 lg:hidden"
            aria-label="关闭侧边栏"
          >
            <MenuIcon open />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-1" aria-label="后台导航">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-xl px-3 py-3 transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                  )}
                >
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-[11px]",
                      active ? "text-emerald-600" : "text-stone-400",
                    )}
                  >
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/admin/posts/new"
            onClick={() => setOpen(false)}
            className="mt-6 flex items-center justify-center rounded-xl bg-stone-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            + 写文章
          </Link>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-medium text-stone-500">当前登录</p>
            <p className="mt-1 truncate text-sm font-semibold text-stone-800">
              {username}
            </p>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              查看前台 ↗
            </Link>
          </div>
        </div>

        <div className="border-t border-stone-200 p-4 text-center text-[11px] text-stone-400">
          {siteConfig.name}
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="打开菜单"
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            <MenuIcon open={false} />
          </button>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              Admin
            </p>
            <p className="truncate text-sm font-semibold text-stone-900">
              {getPageTitle(pathname)}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 sm:inline-flex">
              {username}
            </span>
            <form
              action={logoutAction}
              onSubmit={(event) => {
                if (!window.confirm("确定退出登录吗？")) {
                  event.preventDefault();
                }
              }}
            >
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
              >
                退出登录
              </button>
            </form>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
