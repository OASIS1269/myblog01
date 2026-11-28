import Link from "next/link";

import { buttonPrimary } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-stone-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
        页面不存在
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
        你访问的文章可能已被删除，或者链接有误。
      </p>
      <Link href="/" className={`${buttonPrimary} mt-8`}>
        返回首页
      </Link>
    </main>
  );
}
