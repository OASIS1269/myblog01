import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY);
}

const demoPosts = [
  {
    slug: "hello-myblog",
    title: "你好，MyBlog",
    summary: "博客的第一篇文章，聊聊为什么开始写，以及这里会记录些什么。",
    status: "PUBLISHED" as const,
    views: 36,
    publishedAt: daysAgo(9),
    tags: [
      { name: "随笔", slug: "essay" },
      { name: "MyBlog", slug: "myblog" },
    ],
    content: [
      "这是这个博客的第一篇文章。",
      "",
      "开始写博客的理由很简单：把平时零散的想法整理下来，让它们有一个可以落脚的地方。",
      "",
      "## 这里会写什么",
      "",
      "- 技术实践与踩坑记录",
      "- 产品设计里的思考",
      "- 读书和生活里值得记下来的片段",
      "",
      "> 内容不一定正确，但会尽量真诚。",
      "",
      "如果你恰好路过，欢迎随便看看。",
    ].join("\n"),
  },
  {
    slug: "markdown-guide",
    title: "用 Markdown 写下第一篇技术文章",
    summary: "Markdown 的常用语法速查，以及在这个博客里如何写出一篇结构清晰的文章。",
    status: "PUBLISHED" as const,
    views: 128,
    publishedAt: daysAgo(6),
    tags: [
      { name: "Markdown", slug: "markdown" },
      { name: "写作", slug: "writing" },
    ],
    content: [
      "Markdown 是一门很轻的标记语言，几分钟就能上手。后台编辑器支持实时预览，写完直接发布即可。",
      "",
      "## 常用语法",
      "",
      "### 标题与列表",
      "",
      "用 `#` 表示标题层级，`-` 表示无序列表，`1.` 表示有序列表。",
      "",
      "### 代码块",
      "",
      "```ts",
      "export function greet(name: string) {",
      "  return `Hello, ${name}!`;",
      "}",
      "```",
      "",
      "### 引用与表格",
      "",
      "> 好文章是改出来的，不是一次写出来的。",
      "",
      "| 语法 | 用途 |",
      "| --- | --- |",
      "| `**文本**` | 加粗 |",
      "| `[链接](https://example.com)` | 超链接 |",
      "| `![图片](https://example.com/a.png)` | 图片 |",
      "",
      "## 写完之后",
      "",
      "检查标题、摘要和标签，再点一次「发布」，文章就会出现在首页。",
    ].join("\n"),
  },
  {
    slug: "tech-stack-notes",
    title: "这个博客的技术选型",
    summary: "记录 MyBlog 的技术栈：Next.js、PostgreSQL、Prisma，以及为什么先保持简单。",
    status: "PUBLISHED" as const,
    views: 74,
    publishedAt: daysAgo(3),
    tags: [
      { name: "Next.js", slug: "nextjs" },
      { name: "技术", slug: "tech" },
    ],
    content: [
      "这是一个个人博客，所以第一原则是：**先把内容写出来，再考虑复杂架构**。",
      "",
      "## 用到的东西",
      "",
      "- Next.js App Router：页面与接口放在一个项目里",
      "- PostgreSQL：文章、标签、管理员数据",
      "- Prisma：类型安全的数据库访问",
      "- Tailwind CSS：快速完成响应式布局",
      "",
      "## 一些取舍",
      "",
      "没有做前后端分离，也没有引入评论、搜索和多管理员。这些功能不是第一期必须的，等真正需要时再加。",
      "",
      "```ts",
      "// 简单，但够用",
      "const principle = 'content first';",
      "```",
      "",
      "后面会继续记录开发过程和踩过的坑。",
    ].join("\n"),
  },
  {
    slug: "draft-next-post",
    title: "草稿：下一篇文章正在路上",
    summary: "这是一篇草稿，用来验证草稿不会出现在前台。",
    status: "DRAFT" as const,
    views: 0,
    publishedAt: null,
    tags: [{ name: "随笔", slug: "essay" }],
    content: [
      "这篇内容还在整理中，先保存为草稿。",
      "",
      "草稿只在后台可见，前台访问对应地址时会返回 404。",
    ].join("\n"),
  },
];

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const passwordHash = await hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Admin ready: ${username}`);

  const postCount = await prisma.post.count();

  if (postCount === 0) {
    for (const post of demoPosts) {
      await prisma.post.create({
        data: {
          slug: post.slug,
          title: post.title,
          summary: post.summary,
          cover: null,
          content: post.content,
          status: post.status,
          views: post.views,
          publishedAt: post.publishedAt,
          tags: {
            create: post.tags.map((tag) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tag.name },
                  create: tag,
                },
              },
            })),
          },
        },
      });
    }

    console.log(`Seeded ${demoPosts.length} demo posts`);
  } else {
    console.log(`Skipped demo posts (already ${postCount} posts)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
