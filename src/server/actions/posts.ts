"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import {
  parseTags,
  postFormSchema,
  readFormString,
} from "@/lib/validation";
import {
  createPost,
  deletePost,
  PostNotFoundError,
  PostSlugConflictError,
  updatePost,
} from "@/server/services/posts";
import type { DeletePostResult, PostFormState } from "@/types/actions";

export async function savePostAction(
  _previousState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAdmin();

  const parsed = postFormSchema.safeParse({
    id: readFormString(formData, "id"),
    title: readFormString(formData, "title"),
    summary: readFormString(formData, "summary"),
    cover: readFormString(formData, "cover"),
    slug: readFormString(formData, "slug"),
    tags: readFormString(formData, "tags"),
    content: readFormString(formData, "content"),
    status: readFormString(formData, "status"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];

      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      error: "请检查表单内容",
      fieldErrors,
    };
  }

  const values = parsed.data;
  const isEdit = Boolean(values.id);
  let slug = "";

  try {
    const input = {
      title: values.title,
      summary: values.summary,
      cover: values.cover,
      slug: values.slug,
      tags: parseTags(values.tags),
      content: values.content,
      status: values.status,
    };

    if (isEdit) {
      const post = await updatePost(values.id, input);
      slug = post.slug;
    } else {
      const post = await createPost(input);
      slug = post.slug;
    }
  } catch (error) {
    if (error instanceof PostSlugConflictError) {
      return {
        error: error.message,
        fieldErrors: { slug: error.message },
      };
    }

    if (error instanceof PostNotFoundError) {
      return { error: error.message };
    }

    console.error("Save post failed:", error);
    return { error: "保存失败，请稍后重试" };
  }

  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/dashboard");

  redirect(isEdit ? "/admin/posts?notice=updated" : "/admin/posts?notice=created");
}

export async function deletePostAction(
  id: string,
): Promise<DeletePostResult> {
  await requireAdmin();

  if (!id) {
    return { ok: false, error: "参数错误" };
  }

  try {
    const post = await deletePost(id);

    revalidatePath("/");
    revalidatePath(`/posts/${post.slug}`);
    revalidatePath("/admin/posts");
    revalidatePath("/admin/dashboard");

    return { ok: true };
  } catch (error) {
    console.error("Delete post failed:", error);
    return { ok: false, error: "删除失败，请稍后重试" };
  }
}
