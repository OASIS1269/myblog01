"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";

import { createSession, destroySession } from "@/lib/auth";
import { safeAdminRedirect } from "@/lib/utils";
import { loginSchema, readFormString } from "@/lib/validation";
import { findAdminByUsername } from "@/server/services/admins";
import type { LoginState } from "@/types/actions";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: readFormString(formData, "username"),
    password: readFormString(formData, "password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "请输入账号和密码",
    };
  }

  let admin;

  try {
    admin = await findAdminByUsername(parsed.data.username);
  } catch (error) {
    console.error("Admin lookup failed:", error);
    return { error: "登录失败，请稍后重试" };
  }

  const passwordMatched = admin
    ? await compare(parsed.data.password, admin.passwordHash)
    : false;

  if (!admin || !passwordMatched) {
    return { error: "账号或密码错误" };
  }

  await createSession({
    adminId: admin.id,
    username: admin.username,
  });

  const from = readFormString(formData, "from");

  redirect(safeAdminRedirect(from));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
