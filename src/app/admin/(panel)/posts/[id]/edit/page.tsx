import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/post-form";
import { getPostById } from "@/server/services/posts";

export const metadata: Metadata = {
  title: "编辑文章",
};

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <PostForm
      mode="edit"
      post={{
        id: post.id,
        title: post.title,
        summary: post.summary ?? "",
        cover: post.cover ?? "",
        slug: post.slug,
        content: post.content,
        status: post.status,
        tags: post.tags.map(({ tag }) => tag.name).join(", "),
      }}
    />
  );
}
