"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  buttonPrimary,
  inputClass,
  labelClass,
} from "@/components/ui/styles";
import { loginAction } from "@/server/actions/auth";
import type { LoginState } from "@/types/actions";

const initialState: LoginState = {};

type LoginFormProps = {
  from?: string;
};

export function LoginForm({ from }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl shadow-stone-950/30 sm:p-10">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-stone-900 text-sm font-semibold text-white">
            M
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
              MyBlog Admin
            </p>
            <p className="mt-0.5 text-xs text-stone-400">内容管理后台</p>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-stone-950">
          登录管理后台
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          使用管理员账号继续，未登录无法访问后台页面。
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          <input type="hidden" name="from" value={from ?? ""} />

          <div>
            <label htmlFor="username" className={labelClass}>
              账号
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              maxLength={50}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入管理员账号"
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              密码
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                maxLength={200}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                className={`${inputClass} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 px-4 text-xs font-medium text-stone-500 transition-colors hover:text-emerald-700"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? "隐藏" : "显示"}
              </button>
            </div>
          </div>

          {state.error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={`${buttonPrimary} w-full py-3`}
          >
            {isPending ? "登录中…" : "登录"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-400">
        <Link
          href="/"
          className="transition-colors hover:text-white"
        >
          ← 返回博客首页
        </Link>
      </p>
    </div>
  );
}
