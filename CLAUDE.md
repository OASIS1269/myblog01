# 项目简介

myblog 是一个个人博客系统，分两个端：面向所有读者的用户端（首页、文章详情、关于我），以及仅博主可用的管理后台（登录、仪表盘、文章增删改查）。

> 项目已实现一期主要功能。Next.js 16 存在较多破坏性变更，修改代码前先阅读 `node_modules/next/dist/docs/` 中与当前版本匹配的文档；根目录 `AGENTS.md` 由 `next dev` 维护。

## 技术栈

- 框架：Next.js 16.4.6（App Router）+ React 19.3.0（React DOM 19.3.0）
- 语言：TypeScript 5.9.3
- 样式：Tailwind CSS 4.3.3，通过 `@tailwindcss/turbopack` 4.3.3 加载（`next.config.ts` 中配置，无 PostCSS/Tailwind 配置文件）
- UI 组件：项目内自定义 Tailwind 组件（未引入 shadcn/ui）
- 数据库：PostgreSQL 15（本地 Docker 容器 `myblog-postgres`）
- ORM：Prisma 7.10.1 + `@prisma/adapter-pg` 7.10.1 + `pg` 8.23.1
- 密码哈希：bcryptjs 3.0.3
- 登录凭证：jose 6.2.18（JWT）+ httpOnly Cookie
- 参数校验：Zod 4.6.7
- Markdown：react-markdown 10.1.0 + remark-gfm 4.0.1 + rehype-highlight 7.0.2 + rehype-sanitize 6.0.0 + rehype-slug 6.0.0 + highlight.js 11.12.0
- 测试：Playwright 1.65.1（E2E，使用系统 Edge；Vitest 尚未接入）
- 代码规范：ESLint 9.39.5 + eslint-config-next 16.4.6（Prettier 尚未接入）
- 部署：尚未部署；方案为 Vercel 或 Docker Compose（未配置 CI）

## 常用命令

- `npm run dev`：启动开发服务器（默认 `http://localhost:3000`）
- `npm run build` / `npm run start`：生产构建 / 启动生产服务
- `npm run lint`：ESLint 检查
- `npm run typecheck`：TypeScript 类型检查
- `npm run db:generate`：生成 Prisma Client 到 `src/generated/prisma`（已加入 `.gitignore`）
- `npm run db:migrate`：创建并应用 Prisma 迁移
- `npm run db:seed`：初始化管理员并写入演示文章
- `npm run db:studio`：打开 Prisma Studio
- `npm run test:e2e`：运行 Playwright 测试（需先启动服务；`playwright.config.ts` 默认地址为 `http://localhost:3000`，可用 `PLAYWRIGHT_BASE_URL` 覆盖，浏览器默认使用系统 Edge）

本地数据库由 Docker 容器提供；容器停止时执行 `docker start myblog-postgres`。管理员账号密码由 `.env` 中的 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 在 seed 时写入数据库，请勿将真实密钥提交到仓库。

## 目录约定

除 `prisma/`、`tests/` 外，以下路径均位于 `src/` 下。

- `app/(site)/`：用户端页面与布局；路由组 `(site)` 不出现在 URL 中。
- `app/admin/login/`：管理员登录页，使用独立布局，不套后台侧边栏。
- `app/admin/(panel)/`：需登录的后台页面与布局（侧边栏 + 顶栏 + 鉴权）。
- `app/api/`：Route Handler，仅存放必须通过 URL 调用的接口（阅读量 +1）。
- `components/site/`：用户端组件（导航、页脚、文章卡片、目录、阅读量追踪等）。
- `components/admin/`：后台组件（侧边栏、登录表单、文章表单、删除按钮等）。
- `components/ui/`：通用基础组件与样式常量（分页、状态徽章、Markdown 渲染等）。
- `server/actions/`：Server Actions（文件头写 `"use server"`）：`auth.ts` 管登录/登出，`posts.ts` 管文章增删改。
- `server/services/`：业务逻辑与数据库访问；Prisma 只允许在此层调用。
- `lib/`：通用工具（Prisma 单例、JWT/Cookie、slug 生成、格式化、Zod 校验等）。
- `config/site.ts`：站点名称、导航、关于我内容、社交链接等静态配置。
- `types/`：共享 TypeScript 类型（文章类型、表单 Action 状态类型）。
- `proxy.ts`：Next.js 16 的请求代理（原 Middleware），拦截 `/admin/**` 未登录访问。
- `prisma/`：`schema.prisma`、迁移文件、`seed.ts`。
- `prisma7.config.ts`：Prisma 7 CLI 配置（schema、migrations、datasource URL）。
- `src/generated/prisma/`：Prisma 生成的客户端，勿手改，且不提交。
- `tests/e2e/`：Playwright 端到端测试。
- `playwright.config.ts`：Playwright 配置。

## 数据库表结构要点

> 技术文档中的模型名是 `Post` 和 `Admin`，对应 PRD 中的文章（Article）与管理员。现有设计没有独立的 User 表，博主账号即唯一管理员。

**文章表（`Post`，即 PRD 中的 Article）**

- `id` — String（cuid）— 主键
- `slug` — String — URL 别名，唯一
- `title` — String(100) — 标题，必填
- `summary` — String(200)? — 摘要，为空时从正文截取
- `cover` — String? — 封面图 URL
- `content` — Text — Markdown 正文，必填
- `status` — PostStatus — 枚举 DRAFT / PUBLISHED，默认 DRAFT
- `views` — Int — 阅读量，默认 0
- `publishedAt` — DateTime? — 首次发布时间，仅首次发布时写入
- `createdAt` — DateTime — 创建时间
- `updatedAt` — DateTime — 最后更新时间，自动维护
- `tags` — PostTag[] — 标签关联

索引：`(status, publishedAt desc)` 服务首页列表；`(updatedAt desc)` 服务后台列表。

**管理员表（`Admin`，即用户 / User）**

- `id` — String（cuid）— 主键
- `username` — String — 登录账号，唯一
- `passwordHash` — String — bcrypt 哈希，禁止存明文
- `createdAt` — DateTime — 创建时间

**标签关联（补充）**

- `Tag`：`id`（主键）、`name`（唯一）、`slug`（唯一）
- `PostTag`：`postId` + `tagId` 联合主键；文章删除时级联清理

## 代码规范

- 页面默认使用 Server Component；只有需要状态、事件或浏览器 API 时才加 `"use client"`，并把客户端边界尽量下移到叶子组件。
- 组件名用 PascalCase，文件名用 kebab-case；页面路由文件遵循 Next.js 约定。
- 禁用 `any`；未知类型用 `unknown` + 类型收窄；优先使用 Prisma 生成类型和 Zod 推导类型。
- 数据库操作只能写在 `src/server/services/`；页面、组件和 actions 不得直接调用 Prisma。
- Server Actions 放 `src/server/actions/`（文件头写 `"use server"`）：`auth.ts` 管登录/登出，`posts.ts` 管文章增删改查。
- 写操作固定流程：`requireAdmin()` → Zod 校验 → 调 service → `revalidatePath`；统一返回 `{ ok, data | error }` 或表单状态对象。
- 鉴权三层：`proxy.ts` 重定向（体验层）+ 后台布局 `requireAdmin()` + 每个写操作内部 `requireAdmin()`（安全层）；前端隐藏按钮不算权限控制。
- 所有入参（表单、URL 参数）服务端必须用 Zod 再校验一次；前端校验仅用于体验。
- 登录态使用 `myblog_session` httpOnly Cookie；`src/lib/session.ts` 负责签发/校验 JWT，`src/lib/auth.ts` 负责 Cookie 与 `requireAdmin()`。
- 登录表单和文章表单使用受控输入。Server Action 返回错误后 React 可能重置非受控表单，受控字段可保证用户输入不丢失并能直接重新提交。
- Markdown 渲染必须经过 `rehype-sanitize`；禁止输出未清洗的 HTML。
- API Route Handler 只放必须通过 URL 调用的接口（`app/api/`），业务逻辑同样下沉到 service 层。
- 每次文章创建/更新/删除后调用 `revalidatePath` 刷新首页、详情页与后台列表。
- 命名：Prisma 模型用 PascalCase，字段用 camelCase，环境变量用 UPPER_SNAKE_CASE。
- 密钥只放环境变量，`.env` 不得入库；`AUTH_SECRET` 至少 32 位随机字符串。
- 提交前执行 lint、typecheck、test、build；`main` 分支保护，功能分支 + PR。
- 使用 Next.js 16 新 API 前先查 `node_modules/next/dist/docs/`；`middleware.ts` 已更名为 `proxy.ts`。

## 路由清单

**用户端页面**

| 路由 | 页面 | 权限 |
| --- | --- | --- |
| `/` | 首页，已发布文章分页，`?page=n` | 公开 |
| `/posts/[slug]` | 文章详情，草稿访问返回 404 | 公开 |
| `/about` | 关于我 | 公开 |

**管理后台页面**

| 路由 | 页面 | 权限 |
| --- | --- | --- |
| `/admin` | 重定向到 `/admin/dashboard` | 管理员 |
| `/admin/login` | 管理员登录 | 公开 |
| `/admin/dashboard` | 仪表盘（文章统计 + 最近文章） | 管理员 |
| `/admin/posts` | 文章列表，支持 `?q=&status=&page=` | 管理员 |
| `/admin/posts/new` | 新建文章 | 管理员 |
| `/admin/posts/[id]/edit` | 编辑文章 | 管理员 |

**API 接口**

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/api/posts/[slug]/view` | 阅读量 +1 |

说明：登录/登出与文章增删改查通过 Server Actions 实现，没有独立的 HTTP URL；对应文件为 `src/server/actions/auth.ts` 与 `src/server/actions/posts.ts`。

**自动生成**

- `/sitemap.xml` — 由 `app/sitemap.ts` 生成（包含已发布文章）
- `/robots.txt` — 由 `app/robots.ts` 生成（禁止抓取 `/admin`、`/api/`）

## 当前开发进度

- [x] 产品需求文档 `PRD.md`
- [x] 技术设计文档 `docs/TECH_DESIGN.md`
- [x] 阶段一 地基：项目初始化、PostgreSQL、Prisma Schema、迁移、seed、管理员与演示文章
- [x] 阶段二 用户端：前台布局、首页分页、文章详情（Markdown/代码高亮/TOC/上下篇/阅读量）、关于我、404
- [x] 阶段三 管理后台：登录与鉴权、仪表盘、文章列表（搜索/筛选/分页）、新建/编辑/删除、草稿与发布状态
- [x] 阶段四（部分）：响应式布局（含 320px 检查）、SEO（metadata/sitemap/robots）、Playwright E2E（10 个用例通过）
- [ ] 阶段四（剩余）：CI、生产部署、数据库自动备份、生产环境配置与安全加固
- [ ] 后续迭代（PRD 已列为范围外）：评论、站内搜索、多管理员、暗色模式、RSS 等
