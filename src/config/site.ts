export const siteConfig = {
  name: "个人博客系统",
  brand: "MyBlog",
  description: "记录技术、产品与生活里的思考。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    name: "博主",
    role: "独立开发者 / 写作者",
    bio: "在这里记录做过的事、读过的书，以及那些值得反复琢磨的问题。",
  },
  nav: [
    { href: "/", label: "首页" },
    { href: "/about", label: "关于我" },
  ],
  about: {
    intro: [
      "你好，我是这个博客的博主。白天写代码，晚上写字，偶尔拍点照片。",
      "这个博客用来存放一些关于技术、产品和日常生活的思考。内容不一定正确，但都尽量真诚。",
    ],
    skills: ["Next.js", "TypeScript", "PostgreSQL", "产品设计", "写作"],
    contacts: [
      { label: "GitHub", href: "https://github.com/OASIS1269" },
      { label: "Email", href: "mailto:hello@example.com" },
    ],
  },
} as const;
