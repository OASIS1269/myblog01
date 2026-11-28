"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { buttonDanger } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { deletePostAction } from "@/server/actions/posts";

type DeletePostButtonProps = {
  id: string;
  title: string;
  className?: string;
};

export function DeletePostButton({
  id,
  title,
  className,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `确定删除《${title}》吗？\n删除后不可恢复。`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deletePostAction(id);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      router.push("/admin/posts?notice=deleted");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={cn(buttonDanger, className)}
    >
      {isPending ? "删除中…" : "删除"}
    </button>
  );
}
