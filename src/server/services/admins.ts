import { prisma } from "@/lib/db";

export async function findAdminByUsername(username: string) {
  return prisma.admin.findUnique({
    where: { username },
  });
}
