import GithubSlugger from "github-slugger";

import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);

    if (!match) {
      continue;
    }

    const text = match[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .trim();

    if (!text) {
      continue;
    }

    items.push({
      id: slugger.slug(text),
      text,
      level: match[1].length,
    });
  }

  return items;
}

export function TableOfContents({ content }: { content: string }) {
  const items = extractToc(content);

  if (items.length < 2) {
    return null;
  }

  return (
    <nav aria-label="文章目录">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
        目录
      </p>
      <ul className="mt-4 space-y-2.5 border-l border-stone-200">
        {items.map((item) => (
          <li key={`${item.level}-${item.id}`}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l border-transparent pl-4 text-sm leading-6 text-stone-500 transition-colors hover:border-emerald-500 hover:text-emerald-700",
                item.level === 3 && "pl-7 text-[13px]",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
