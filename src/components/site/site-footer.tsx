import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          © {year} {siteConfig.brand}. 用文字记录时间。
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {siteConfig.about.contacts.map((contact) => (
            <a
              key={contact.href}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-emerald-700"
            >
              {contact.label}
            </a>
          ))}
          <Link
            href="/admin/login"
            className="transition-colors hover:text-emerald-700"
          >
            管理后台
          </Link>
        </div>
      </div>
    </footer>
  );
}
