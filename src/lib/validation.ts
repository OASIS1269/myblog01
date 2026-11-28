import { z } from "zod";

export function parseTags(input: string): string[] {
  const tags = input
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(new Set(tags)).slice(0, 10);
}

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入账号").max(50, "账号过长"),
  password: z.string().min(1, "请输入密码").max(200, "密码过长"),
});

const tagsField = z
  .string()
  .trim()
  .max(200, "标签总长度不能超过 200 个字符")
  .optional()
  .default("")
  .refine((value) => parseTags(value).length <= 10, "最多添加 10 个标签")
  .refine(
    (value) => parseTags(value).every((tag) => tag.length <= 20),
    "单个标签不能超过 20 个字符",
  );

export const postFormSchema = z.object({
  id: z.string().trim().optional().default(""),
  title: z
    .string()
    .trim()
    .min(1, "请输入标题")
    .max(100, "标题不能超过 100 个字符"),
  summary: z
    .string()
    .trim()
    .max(200, "摘要不能超过 200 个字符")
    .optional()
    .default(""),
  cover: z
    .string()
    .trim()
    .max(500, "封面图地址过长")
    .optional()
    .default("")
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value),
      "封面图需要以 http:// 或 https:// 开头",
    ),
  slug: z
    .string()
    .trim()
    .max(80, "URL 别名不能超过 80 个字符")
    .optional()
    .default("")
    .refine(
      (value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "只能使用小写字母、数字和连字符",
    ),
  tags: tagsField,
  content: z
    .string()
    .trim()
    .min(1, "请输入正文")
    .max(100_000, "正文过长"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type PostFormSchemaValues = z.infer<typeof postFormSchema>;

export function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function parsePageParam(
  value: string | string[] | undefined,
  fallback = 1,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseStatusParam(
  value: string | string[] | undefined,
): "DRAFT" | "PUBLISHED" | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  return raw === "DRAFT" || raw === "PUBLISHED" ? raw : undefined;
}
