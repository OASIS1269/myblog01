import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "关于我",
  description: `认识 ${siteConfig.brand} 背后的博主，以及这个博客记录的内容。`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside>
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-teal-800 text-3xl font-semibold text-white shadow-inner">
              M
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-stone-950">
              {siteConfig.brand}
            </h1>
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {siteConfig.author.role}
            </p>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              {siteConfig.author.bio}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {siteConfig.about.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-stone-900">联系我</h2>
            <div className="mt-4 flex flex-col gap-3">
              {siteConfig.about.contacts.map((contact) => (
                <a
                  key={contact.href}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-sm text-stone-600 transition-colors hover:text-emerald-700"
                >
                  <span>{contact.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
            About
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
            关于这个博客
          </h2>

          <div className="mt-6 space-y-4 text-base leading-8 text-stone-600">
            {siteConfig.about.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 border-t border-stone-200 pt-8">
            <h3 className="text-lg font-semibold text-stone-900">
              这里会记录什么
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {siteConfig.about.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="mt-10 border-l-2 border-emerald-500 pl-5 text-base italic leading-8 text-stone-500">
            写下来，是为了想清楚。
          </blockquote>
        </section>
      </div>
    </div>
  );
}
