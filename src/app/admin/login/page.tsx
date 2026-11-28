import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";
import { getFirstString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "管理员登录",
};

type LoginPageProps = {
  searchParams: Promise<{
    from?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const from = getFirstString(params.from);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-stone-950 px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="relative z-10">
        <LoginForm from={from} />
      </div>
    </main>
  );
}
