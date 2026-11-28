import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await requireAdmin();

  return <AdminShell username={session.username}>{children}</AdminShell>;
}
