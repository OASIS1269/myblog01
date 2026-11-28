import { badgeClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  const published = status === "PUBLISHED";

  return (
    <span
      className={cn(
        badgeClass,
        published
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15",
      )}
    >
      {published ? "已发布" : "草稿"}
    </span>
  );
}
