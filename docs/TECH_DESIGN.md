# 个人博客系统技术设计文档

| 项目 | 内容 |
| --- | --- |
| 文档名称 | myblog 个人博客系统技术设计文档 |
| 文档版本 | v1.0 |
| 编写日期 | 2026-11-26 |
| 关联文档 | [PRD.md](../PRD.md) |
| 文档状态 | 初稿 |

> 总思路：做成一个**全栈单体**应用 —— 一个 Next.js 项目同时承载前台展示与后台管理，一个 PostgreSQL 数据库存全部数据。先跑通"读者能看"，再跑通"博主能管"，最后完成响应式、测试与上线。

---

## 1. 技术选型

| 层面 | 选择 | 选它的理由（大白话版） |
| --- | --- | --- |
| 全栈框架 | **Next.js（App Router）+ TypeScript** | 博客需要被搜索引擎收录，必须服务端渲染；后台又有一堆表单交互。Next.js 一个项目同时写页面和接口，不用维护两套工程 |
| UI / 样式 | **Tailwind CSS + shadcn/ui** | 写响应式最快；shadcn 的按钮、弹窗、表格是"把代码复制进项目"，样式完全可控，不是黑盒组件库 |
| 数据库 | **PostgreSQL** | 免费、稳定、云服务商多；文章和标签是典型的关系数据，合适 |
| ORM | **Prisma** | 用一份 `schema.prisma` 描述表结构，自动生成迁移脚本和类型安全的查询代码，少写 SQL、少出错 |
| 登录鉴权 | **bcrypt + jose（JWT）+ httpOnly Cookie** | 只有一个管理员，用不着整套账号体系。密码加密存库，登录后发一个浏览器脚本拿不到的 Cookie 凭证，够用且安全 |
| 表单校验 | **Zod** | 登录、写文章的表单规则写一份，前端后端共用，避免"前端放过了、后端又炸了" |
| Markdown | **react-markdown + remark-gfm + rehype-highlight + rehype-sanitize** | 后台写 Markdown，前台渲染；同时过滤掉恶意脚本（XSS） |
| 测试 / 规范 | **Vitest + Playwright + ESLint + Prettier** | 关键流程（登录、增删改查）用浏览器自动化跑一遍，防止改坏 |
| 部署 | **Vercel 或 Docker Compose** | 前者零运维，后者国内访问稳；代码不用改，只换部署方式 |

**补充说明：**

- **为什么不做前后端分离？** 个人博客流量小、单人维护。拆成两个工程意味着两套部署、两套日志、跨域联调，成本翻倍。将来真要接小程序，把服务层函数再包一层 REST API 即可，不用现在为它买单。
- **如果你更熟 Vue**：整套设计可以 1:1 换成 **Nuxt 3 + Nitro + Prisma**，页面、路由、服务层概念一一对应，不影响整体方案。

---

## 2. 架构规范

**一句话原则：页面只负责展示，服务层负责业务，Prisma 只出现在服务层。**

```
页面 / 组件（以 Server Component 为主）
        ↓ 调用
Server Action / Route Handler（鉴权 + Zod 校验 + 错误包装）
        ↓
Service 服务层（查文章、建文章、统计……所有业务逻辑）
        ↓
Prisma → PostgreSQL
```

具体约定：

1. **服务端优先**：前台页面全部是服务端组件（Server Component），不往浏览器塞无谓的 JS；只有编辑器实时预览、删除确认弹窗、手机端菜单这类需要交互的地方才用客户端组件。
2. **入口薄、服务厚**：Server Action 只做四件事 —— 校验登录、校验参数、调服务层、包装返回结果。业务逻辑一律放 `server/services`，方便前台页面和后台 action 复用。
3. **鉴权做三层，缺一不可**：
   - `middleware.ts` 拦 `/admin/**`，未登录直接跳登录页（这是体验层）；
   - 后台布局再校验一次（防止中间件漏网）；
   - **每一个写操作（新增/编辑/删除）内部再调 `requireAdmin()`**（这才是安全层）。前端把按钮藏起来不叫权限控制。
4. **一份校验规则两处用**：同一个 Zod schema，表单提交前用一次，服务端收请求后再用一次。永远不信前端。
5. **写完就刷新**：文章发布/修改/删除后调 `revalidatePath`，让首页和详情页立刻拿到新数据。
6. **返回格式统一**：Server Action 一律返回 `{ ok: true, data }` 或 `{ ok: false, error }`，UI 统一弹提示，不各写各的。
7. **Markdown 必须清洗**：渲染前过 `rehype-sanitize`；不要把原始 HTML 直接塞进页面。
8. **配置集中管理**：站点名、导航、关于我文案放 `src/config/site.ts`；密钥只放环境变量，`.env` 永远不进 Git。
9. **工程规范**：文件名 kebab-case、组件名 PascalCase；`main` 分支保护，功能分支 + PR；CI 跑 lint / typecheck / test / build 四道关。

---

## 3. 项目目录结构

```
myblog/
├─ prisma/
│  ├─ schema.prisma            # 数据模型
│  ├─ migrations/              # 迁移脚本
│  └─ seed.ts                  # 初始化管理员 + 演示文章
├─ public/                     # 静态资源（favicon、占位图）
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # 根布局（html/body、字体）
│  │  ├─ globals.css
│  │  ├─ not-found.tsx
│  │  ├─ (site)/               # 前台路由组，不影响 URL
│  │  │  ├─ layout.tsx         # 导航栏 + 页脚
│  │  │  ├─ page.tsx           # 首页 /
│  │  │  ├─ posts/[slug]/page.tsx
│  │  │  └─ about/page.tsx
│  │  ├─ admin/
│  │  │  ├─ login/page.tsx     # 独立登录页（不套后台布局）
│  │  │  └─ (panel)/
│  │  │     ├─ layout.tsx      # 侧边栏 + 顶栏 + 登录校验
│  │  │     ├─ dashboard/page.tsx
│  │  │     └─ posts/
│  │  │        ├─ page.tsx     # 列表
│  │  │        ├─ new/page.tsx
│  │  │        └─ [id]/edit/page.tsx
│  │  ├─ api/posts/[slug]/view/route.ts   # 阅读量 +1
│  │  ├─ sitemap.ts            # 自动生成站点地图
│  │  └─ robots.ts
│  ├─ components/
│  │  ├─ site/                 # 导航、页脚、文章卡片、分页、TOC、Markdown 渲染
│  │  ├─ admin/                # 侧边栏、统计卡、文章表格、编辑器、删除弹窗
│  │  └─ ui/                   # 通用 Button / Input / Dialog / Table / Badge
│  ├─ server/
│  │  ├─ actions/              # auth.ts、posts.ts，文件头写 "use server"
│  │  └─ services/             # posts.ts：所有文章业务 + Prisma 查询
│  ├─ lib/
│  │  ├─ db.ts                 # Prisma 单例（防止开发热更新时连接数爆炸）
│  │  ├─ auth.ts               # JWT 签发/校验、Cookie 读写、requireAdmin
│  │  ├─ markdown.tsx          # Markdown 渲染组件
│  │  ├─ slug.ts               # 生成/校验 URL 别名
│  │  └─ utils.ts
│  ├─ config/site.ts           # 站点名、导航、关于我内容、社交链接
│  ├─ types/
│  └─ middleware.ts            # /admin 登录拦截
├─ tests/e2e/                  # Playwright 端到端测试
├─ .env.example
├─ Dockerfile
├─ docker-compose.yml
├─ PRD.md
└─ package.json
```

两个带括号的目录 `(site)`、`(panel)` 是 Next.js 的"路由组"：**括号里的名字不会出现在网址里**，只是用来给不同区域套不同的布局（前台有导航页脚，后台有侧边栏）。

---

## 4. 路由设计

| 网址 | 对应页面 | 渲染方式 / 参数 | 访问权限 |
| --- | --- | --- | --- |
| `/` | 首页 | 服务端渲染，`?page=n` 分页，每页 8 篇 | 公开，只查已发布 |
| `/posts/[slug]` | 文章详情 | 服务端渲染 + Markdown 渲染 | 公开，草稿访问返回 404 |
| `/about` | 关于我 | 读取配置文件渲染 | 公开 |
| `/admin/login` | 管理员登录 | 表单 + Server Action | 公开（已登录自动跳仪表盘） |
| `/admin` | 后台入口 | 重定向到仪表盘 | 管理员 |
| `/admin/dashboard` | 仪表盘 | 服务端统计查询 | 管理员 |
| `/admin/posts` | 文章列表 | `?q=&status=&page=` 搜索筛选分页 | 管理员 |
| `/admin/posts/new` | 新建文章 | 表单 | 管理员 |
| `/admin/posts/[id]/edit` | 编辑文章 | 表单预填 | 管理员 |
| `POST /api/posts/[slug]/view` | 阅读量 +1 | 接口，详情页挂载后调用 | 公开 |

**一个和 PRD 的小调整**：PRD 里详情页写的是 `/posts/:id`，实现时建议改成 `/posts/[slug]`，比如 `/posts/hello-world` 比 `/posts/clx8f3k...` 好看，也更利于 SEO。后台编辑器加一个"URL 别名（slug）"选填项，留空就自动生成一串短随机字符，保证不重复。如果更喜欢用 id，改动很小。

**登录拦截规则**：访问 `/admin` 下除登录页以外的任何地址，没有有效凭证就跳到 `/admin/login?from=原地址`，登录成功后回到原地址；退出登录后清 Cookie，浏览器后退也进不去。

---

## 5. 数据库 Schema（Prisma）

```prisma
enum PostStatus {
  DRAFT
  PUBLISHED
}

model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String   // bcrypt 加密后的密码，绝不存明文
  createdAt    DateTime @default(now())
}

model Post {
  id          String     @id @default(cuid())
  slug        String     @unique          // URL 别名
  title       String     @db.VarChar(100)
  summary     String?    @db.VarChar(200)
  cover       String?                     // 封面图 URL
  content     String     @db.Text         // Markdown 原文
  status      PostStatus @default(DRAFT)
  views       Int        @default(0)      // 阅读量
  publishedAt DateTime?                   // 首次发布时间
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  tags        PostTag[]

  @@index([status, publishedAt(sort: Desc)])  // 首页列表查询
  @@index([updatedAt(sort: Desc)])            // 后台列表查询
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  slug  String    @unique
  posts PostTag[]
}

model PostTag {
  postId String
  tagId  String
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@index([tagId])
}
```

几个设计要点，翻译成人话：

- **状态用枚举而不是字符串**：只有"草稿 / 已发布"两种，前台查询永远带上 `status = PUBLISHED`，草稿不可能漏出去。
- **`publishedAt` 只在第一次发布时写入**：草稿改发布记一次时间，后来再编辑不改它，保证"按发布时间排序"稳定。`updatedAt` 由 Prisma 自动维护，给后台列表用。
- **标签是多对多**：一篇文章多个标签、一个标签多篇文章，中间表 `PostTag` 连接；删文章时关联自动清理（级联删除）。
- **阅读量在详情页打开后异步 +1**：走单独的接口，避免页面缓存导致数字不准；用数据库原子自增 `views = views + 1`，并发也不会算错。
- **管理员只有一条记录**：`seed.ts` 从环境变量读初始账号密码，bcrypt 加密后 `upsert` 进去；重复执行 seed 不会重复建号。
- **索引提前建好**：首页按"状态 + 发布时间"查，后台按"更新时间"排，各建一个索引，数据量大了也不至于全表扫。

---

## 6. 实现步骤

按"先能看 → 再能管 → 最后上线"的顺序，拆成 12 步。每步都写清楚"做完能验收什么"。

### 第一阶段：地基（约 1 天）

**1. 初始化项目**

用 `create-next-app` 建 TypeScript + Tailwind + ESLint 项目；本地用 Docker 起一个 PostgreSQL；写好 `.env.example`。

✅ 验收：`npm run dev` 能打开首页，数据库能连上。

**2. 建表 + 初始化数据**

写 `schema.prisma`，跑 `prisma migrate dev` 生成表；写 `seed.ts` 创建管理员，顺便塞 2 篇演示文章。

✅ 验收：Prisma Studio 里能看到三张表，管理员和演示文章都在。

### 第二阶段：先让读者能看（约 2–3 天）

**3. 前台外壳**

搭 `(site)` 布局：顶部导航（桌面横排、手机汉堡菜单）、页脚、全局配色和字体。

✅ 验收：手机和电脑上导航都正常，没有横向滚动条。

**4. 首页**

服务层写"查已发布文章 + 分页"；页面用文章卡片展示标题、摘要、日期、标签；加空状态和分页器。

✅ 验收：演示文章按时间倒序出现，翻页正确，草稿文章看不见。

**5. 文章详情页**

Markdown 渲染、代码高亮、元信息（作者/时间/标签/阅读量）、上一篇/下一篇、桌面端右侧目录 TOC；文章不存在时走 404。

✅ 验收：排版正常，草稿通过 URL 访问显示 404，手机上正文不溢出。

**6. 关于我页**

读 `config/site.ts` 渲染头像、简介、社交链接。

✅ 验收：改配置文件刷新页面即生效。

### 第三阶段：再让博主能管（约 3–4 天）

**7. 登录闭环**

登录页 + Server Action：查管理员 → bcrypt 比对 → 签发 JWT 写进 httpOnly Cookie；`middleware.ts` 拦截后台；退出登录清 Cookie。顺手加失败次数限制（5 次锁 10 分钟）。

✅ 验收：密码错有提示；未登录访问 `/admin/dashboard` 被弹回登录页；退出后浏览器后退进不去。

**8. 后台框架 + 仪表盘**

后台侧边栏（手机端变抽屉）、顶部栏、面包屑；仪表盘四个统计卡（总数 / 已发布 / 草稿 / 总阅读量）+ 最近 5 篇编辑过的文章。

✅ 验收：总数 = 已发布 + 草稿；点最近文章能进编辑页。

**9. 文章列表**

表格 + 标题搜索 + 状态筛选 + 分页；删除按钮带二次确认弹窗。

✅ 验收：搜索筛选可组合生效；取消删除不产生变化，确认后列表刷新。

**10. 新建 / 编辑文章**

同一套表单组件两处复用：标题、摘要、封面 URL、标签输入、Markdown 编辑器（带实时预览）、草稿/发布切换；Zod 校验；保存后刷新前台缓存。删除、草稿转发布、发布转草稿都在这步收尾。

✅ 验收：必填校验生效；草稿前台不可见；发布后前台立刻能访问；改完保存后详情页内容同步更新。

### 第四阶段：打磨与上线（约 2–3 天）

**11. 响应式、SEO、细节**

按 320 / 375 / 768 / 1024 / 1440 五个宽度逐页过一遍；补 `generateMetadata`（标题、描述、OG）、`sitemap.ts`、`robots.ts`；补加载态、错误页、空状态；检查表单 label、键盘可操作等基础无障碍。

✅ 验收：三个断点布局符合 PRD 第 4 章；320px 无整体横向滚动；Lighthouse 性能/SEO 目标 ≥ 90。

**12. 自动化测试 + 部署**

Playwright 跑通一条主链路：**登录 → 新建草稿 → 发布 → 前台可见 → 编辑 → 删除 → 前台 404**；CI 加 lint/typecheck/test/build；按第 7 节部署；配置每日数据库备份。

✅ 验收：线上把这条链路完整走通，备份文件能恢复。

> 粗略估时：全天投入约 **7–10 个工作日**；每天 2 小时左右的业余节奏约 **3–4 周**。

---

## 7. 部署方案

两个方案，代码完全一样，只是"住哪儿"不同。

### 方案 A：Vercel + Neon（推荐先用来快速上线）

| 步骤 | 做什么 |
| --- | --- |
| 1 | 把代码推到 GitHub，在 Vercel 里导入仓库 |
| 2 | 在 Neon / Supabase 建一个免费 PostgreSQL，拿到连接串 |
| 3 | Vercel 配环境变量：`DATABASE_URL`、`AUTH_SECRET`、`NEXT_PUBLIC_SITE_URL`、初始管理员账号密码 |
| 4 | 首次部署时执行一次 `prisma migrate deploy` 和 seed（本地指生产库跑，或放 CI 里） |
| 5 | 绑定域名，HTTPS 自动配好 |

优点：推代码就上线，不用管服务器。缺点：国内访问速度可能不稳定；Serverless 环境要使用带连接池的数据库连接串。

### 方案 B：国内 VPS + Docker Compose（访问稳、可控）

一台 2 核 2G 的 Linux 服务器，用 Docker Compose 起四个服务：

```
Nginx（80/443，HTTPS + 反向代理）
   ↓
Next.js 应用容器（3000 端口，output: standalone）
   ↓
PostgreSQL 容器（数据挂载 volume，不暴露公网）
   ↓
Certbot（自动续期证书）
```

要点：

1. 多阶段 `Dockerfile` 构建，产物只保留运行所需文件，镜像小、启动快。
2. 部署流程：拉代码 → `prisma migrate deploy` → 重启应用容器；迁移失败就不切流量。
3. 数据库每天定时 `pg_dump` 备份，保留 7–30 天，最好再传一份到对象存储（异地）。
4. 防火墙只开 22 / 80 / 443；数据库端口不对公网开放。
5. 域名解析到服务器；如果服务器在中国大陆，域名需要先完成 ICP 备案。
6. CI 用 GitHub Actions 跑检查，通过后 SSH 到服务器执行部署脚本（或手动一条命令）。

### 环境变量清单（两种方案通用）

| 变量 | 用途 | 注意 |
| --- | --- | --- |
| `DATABASE_URL` | 数据库连接串 | 生产库密码要强，Vercel 用连接池地址 |
| `AUTH_SECRET` | 签发登录凭证的密钥 | 至少 32 位随机串，泄露等于后台失守 |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | 仅初始化管理员时使用 | 不要用于运行时校验；密码用强密码 |
| `NEXT_PUBLIC_SITE_URL` | 站点正式地址 | 用于生成 sitemap 和分享链接 |

**上线前必查清单**：

- HTTPS 生效
- Cookie 带 `HttpOnly + Secure + SameSite`
- bcrypt 成本 10–12
- 登录限流开启
- Markdown 已清洗
- 数据库不对公网开放
- `.env` 没进 Git
- 备份能成功恢复
- 404 / 错误页正常

---

## 8. 方案取舍

- **单体而不是微服务**：个人博客完全撑得住，少一半运维成本；将来真有大流量或第二端，再按服务层边界拆分。
- **CMS 自研而不是上 WordPress**：需求简单、可控性高，也正好是一次完整的全栈练习；代价是评论、搜索、图片上传这些要自己排期（已放进 PRD 的"后续迭代"）。
- **关于我放配置文件而不是后台**：一期只有博主一人改，改配置文件 + 重新部署足够简单；后续要做"后台可编辑"再加一张单页配置表即可，不影响现有结构。

---

## 9. 文档变更记录

| 版本 | 日期 | 修改人 | 修改内容 |
| --- | --- | --- | --- |
| v1.0 | 2026-11-26 | — | 初稿，技术选型、架构规范、目录结构、路由设计、数据库 Schema、实现步骤与部署方案 |
