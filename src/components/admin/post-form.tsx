"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { DeletePostButton } from "@/components/admin/delete-post-button";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  buttonPrimary,
  buttonSecondary,
  cardClass,
  fieldErrorClass,
  fieldHintClass,
  inputClass,
  labelClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { savePostAction } from "@/server/actions/posts";
import type { PostFormState } from "@/types/actions";

type PostFormDefaults = {
  id: string;
  title: string;
  summary: string;
  cover: string;
  slug: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  tags: string;
};

type PostFormProps = {
  mode: "create" | "edit";
  post?: PostFormDefaults;
};

const initialState: PostFormState = {};

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClass}>{message}</p>;
}

export function PostForm({ mode, post }: PostFormProps) {
  const [state, formAction, isPending] = useActionState(
    savePostAction,
    initialState,
  );
  const [title, setTitle] = useState(post?.title ?? "");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [cover, setCover] = useState(post?.cover ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [tags, setTags] = useState(post?.tags ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const fieldErrors = state.fieldErrors;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            文章管理
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-950">
            {mode === "create" ? "新建文章" : "编辑文章"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {mode === "create"
              ? "写下标题和正文，保存草稿或直接发布。"
              : "修改文章内容，或切换文章的发布状态。"}
          </p>
        </div>
        <Link href="/admin/posts" className={buttonSecondary}>
          返回列表
        </Link>
      </div>

      {state.error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6">
        <input type="hidden" name="id" value={post?.id ?? ""} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className={`${cardClass} p-5 sm:p-6`}>
              <div>
                <label htmlFor="title" className={labelClass}>
                  文章标题
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="给这篇文章起一个标题"
                  className={cn(inputClass, "mt-2 text-base font-medium")}
                  aria-invalid={Boolean(fieldErrors?.title)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                />
                <ErrorText message={fieldErrors?.title} />
                <p className={fieldHintClass}>最多 100 个字符</p>
              </div>

              <div className="mt-5">
                <label htmlFor="summary" className={labelClass}>
                  摘要
                  <span className="ml-1 font-normal text-stone-400">
                    （选填）
                  </span>
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  maxLength={200}
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="用一两句话介绍这篇文章，留空时会自动从正文截取"
                  className={cn(inputClass, "mt-2 resize-y")}
                  aria-invalid={Boolean(fieldErrors?.summary)}
                />
                <ErrorText message={fieldErrors?.summary} />
                <p className={fieldHintClass}>
                  最多 200 个字符，留空时自动从正文截取
                </p>
              </div>
            </section>

            <section className={`${cardClass} p-5 sm:p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label htmlFor="content" className={labelClass}>
                    正文
                  </label>
                  <p className="mt-1 text-xs text-stone-500">
                    支持 Markdown 语法，可切换到预览查看渲染效果；正文建议从二级标题（##）开始。
                  </p>
                </div>

                <div className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    aria-pressed={!showPreview}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      !showPreview
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-800",
                    )}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    aria-pressed={showPreview}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      showPreview
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-500 hover:text-stone-800",
                    )}
                  >
                    预览
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {showPreview ? (
                  <>
                    <input type="hidden" name="content" value={content} />
                    <div className="min-h-[420px] rounded-xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
                      {content.trim() ? (
                        <MarkdownContent content={content} />
                      ) : (
                        <p className="text-sm text-stone-400">
                          还没有内容，切换到「编辑」开始写吧。
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows={20}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder={"## 小标题\n\n从这里开始写正文，支持 Markdown 语法。"}
                    spellCheck={false}
                    className={cn(
                      inputClass,
                      "min-h-[420px] resize-y font-mono text-sm leading-6",
                    )}
                    aria-invalid={Boolean(fieldErrors?.content)}
                  />
                )}
                <ErrorText message={fieldErrors?.content} />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className={`${cardClass} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-stone-900">
                  发布
                </h2>
                {post && <StatusBadge status={post.status} />}
              </div>

              <p className="mt-3 text-xs leading-5 text-stone-500">
                点击「发布」后文章会立即出现在前台；点击「保存草稿」仅后台可见。
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="submit"
                  name="status"
                  value="PUBLISHED"
                  disabled={isPending}
                  className={`${buttonPrimary} w-full`}
                >
                  {isPending
                    ? "保存中…"
                    : mode === "create"
                      ? "发布文章"
                      : "保存并发布"}
                </button>
                <button
                  type="submit"
                  name="status"
                  value="DRAFT"
                  disabled={isPending}
                  className={`${buttonSecondary} w-full`}
                >
                  {mode === "edit" && post?.status === "PUBLISHED"
                    ? "转为草稿"
                    : "保存草稿"}
                </button>
                <Link
                  href="/admin/posts"
                  className="mt-1 inline-flex h-10 items-center justify-center text-sm text-stone-500 transition-colors hover:text-stone-800"
                >
                  取消
                </Link>
              </div>

              {mode === "edit" && post && (
                <div className="mt-5 border-t border-stone-200 pt-4">
                  <DeletePostButton
                    id={post.id}
                    title={post.title}
                    className="w-full"
                  />
                </div>
              )}
            </section>

            <section className={`${cardClass} p-5`}>
              <h2 className="text-sm font-semibold text-stone-900">
                文章信息
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="slug" className={labelClass}>
                    URL 别名
                    <span className="ml-1 font-normal text-stone-400">
                      （选填）
                    </span>
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    maxLength={80}
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="hello-world"
                    className={cn(inputClass, "mt-2 font-mono text-xs")}
                    aria-invalid={Boolean(fieldErrors?.slug)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                      }
                    }}
                  />
                  <ErrorText message={fieldErrors?.slug} />
                  <p className={fieldHintClass}>
                    只能使用小写字母、数字和连字符；留空自动生成
                  </p>
                </div>

                <div>
                  <label htmlFor="cover" className={labelClass}>
                    封面图地址
                    <span className="ml-1 font-normal text-stone-400">
                      （选填）
                    </span>
                  </label>
                  <input
                    id="cover"
                    name="cover"
                    type="text"
                    maxLength={500}
                    value={cover}
                    onChange={(event) => setCover(event.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className={cn(inputClass, "mt-2 text-xs")}
                    aria-invalid={Boolean(fieldErrors?.cover)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                      }
                    }}
                  />
                  <ErrorText message={fieldErrors?.cover} />
                  <p className={fieldHintClass}>
                    填写完整的 http(s) 图片地址
                  </p>
                </div>

                <div>
                  <label htmlFor="tags" className={labelClass}>
                    标签
                    <span className="ml-1 font-normal text-stone-400">
                      （选填）
                    </span>
                  </label>
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    maxLength={200}
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="技术, Next.js, 随笔"
                    className={cn(inputClass, "mt-2")}
                    aria-invalid={Boolean(fieldErrors?.tags)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                      }
                    }}
                  />
                  <ErrorText message={fieldErrors?.tags} />
                  <p className={fieldHintClass}>
                    用逗号分隔，最多 10 个标签
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}
