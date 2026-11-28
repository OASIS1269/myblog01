import type { Metadata } from "next";

import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = {
  title: "新建文章",
};

export default function NewPostPage() {
  return <PostForm mode="create" />;
}
