import { expect, test } from "@playwright/test";

const username = process.env.ADMIN_USERNAME ?? "admin";
const password = process.env.ADMIN_PASSWORD ?? "admin123456";

test.describe("用户端", () => {
  test("首页展示文章并可进入详情", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "个人博客系统", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("最新文章")).toBeVisible();
    await expect(page.getByText("你好，MyBlog")).toBeVisible();
    await expect(page.getByText("草稿：下一篇文章正在路上")).toHaveCount(0);

    await page.getByRole("link", { name: /你好，MyBlog/ }).first().click();

    await expect(page.locator("article header h1")).toHaveText("你好，MyBlog");
    await expect(page.locator(".article-content")).toContainText(
      "这是这个博客的第一篇文章",
    );
  });

  test("关于我页面可访问", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "关于这个博客" }),
    ).toBeVisible();
    await expect(page.getByText("联系我")).toBeVisible();
  });

  test("草稿文章在前台返回 404", async ({ page }) => {
    const response = await page.goto("/posts/draft-next-post");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("页面不存在")).toBeVisible();
  });
});

test.describe("320px 最小宽度", () => {
  test.use({ viewport: { width: 320, height: 720 } });

  test("用户端页面无横向滚动", async ({ page }) => {
    for (const path of ["/", "/about", "/posts/markdown-guide"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `页面 ${path} 出现横向滚动`).toBe(false);
    }
  });

  test("后台文章列表无横向滚动", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("账号").fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.goto("/admin/posts");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("移动端响应式", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("前台移动菜单与页面无横向滚动", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "打开菜单" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "打开菜单" }).click();

    const mobileMenu = page.locator("#mobile-site-menu");
    await expect(mobileMenu).toBeVisible();
    await mobileMenu.getByRole("link", { name: "关于我" }).click();

    await expect(page).toHaveURL(/\/about/);
    await expect(
      page.getByRole("heading", { name: "关于这个博客" }),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test("后台移动端抽屉导航可用", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("账号").fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.getByRole("button", { name: "打开菜单" }).click();
    const sidebar = page.locator("#admin-sidebar");
    await expect(sidebar).toBeVisible();
    await sidebar.getByRole("link", { name: "文章管理" }).click();

    await expect(page).toHaveURL(/\/admin\/posts/);
    await expect(
      page.getByRole("heading", { name: "文章管理", level: 1 }),
    ).toBeVisible();
    await expect(
      page.locator("article").getByText("你好，MyBlog").first(),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("管理后台", () => {
  test("错误密码提示，正确密码可登录", async ({ page }) => {
    await page.goto("/admin/dashboard");

    await expect(page).toHaveURL(/\/admin\/login/);

    await page.getByLabel("账号").fill(username);
    await page.locator('input[name="password"]').fill("wrong-password");
    await page.getByRole("button", { name: "登录" }).click();

    await expect(page.getByText("账号或密码错误")).toBeVisible();
    await expect(page.getByLabel("账号")).toHaveValue(username);

    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "登录" }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "仪表盘", level: 1 }),
    ).toBeVisible();
  });

  test("URL 别名冲突后可修正并重新提交", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("账号").fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    const unique = Date.now().toString(36);
    const title = `E2E 冲突测试 ${unique}`;

    await page.goto("/admin/posts/new");
    await page.getByLabel("文章标题").fill(title);
    await page.getByLabel("正文").fill("用于验证表单错误后可以继续修改并提交。");
    await page.getByLabel("URL 别名").fill("hello-myblog");
    await page.getByRole("button", { name: "发布文章" }).click();

    await expect(
      page.getByText("该 URL 别名已被使用").first(),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/posts\/new/);
    await expect(page.getByLabel("文章标题")).toHaveValue(title);

    await page.getByLabel("URL 别名").fill(`e2e-${unique}`);
    await page.getByRole("button", { name: "发布文章" }).click();

    await expect(page).toHaveURL(/\/admin\/posts\?notice=created/);
    const row = page.getByRole("row", { name: new RegExp(title) });
    await expect(row).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "删除" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\?notice=deleted/);
  });

  test("文章创建、编辑、查看与删除", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("账号").fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    const unique = Date.now().toString(36);
    const title = `E2E 测试文章 ${unique}`;
    const updatedTitle = `${title}（已更新）`;

    await page.goto("/admin/posts/new");
    await page.getByLabel("文章标题").fill(title);
    await page.getByLabel("摘要").fill("这是一篇由 Playwright 创建的测试文章。");
    await page.getByLabel("正文").fill(
      "## 测试小节\n\n这是测试正文，包含 `inline code`。",
    );
    await page.getByLabel("标签").fill("测试, Playwright");
    await page.getByRole("button", { name: "发布文章" }).click();

    await expect(page).toHaveURL(/\/admin\/posts\?notice=created/);
    await expect(page.getByRole("status")).toContainText("文章创建成功");

    const createdRow = page.getByRole("row", { name: new RegExp(title) });
    await expect(createdRow).toBeVisible();

    await createdRow.getByRole("link", { name: "编辑", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "编辑文章", level: 1 }),
    ).toBeVisible();

    const slug = await page.getByLabel("URL 别名").inputValue();

    await page.getByLabel("文章标题").fill(updatedTitle);
    await page.getByRole("button", { name: "保存并发布" }).click();

    await expect(page).toHaveURL(/\/admin\/posts\?notice=updated/);
    await expect(page.getByRole("status")).toContainText("文章更新成功");
    await expect(
      page.getByRole("row", { name: new RegExp(updatedTitle) }),
    ).toBeVisible();

    await page.goto(`/posts/${slug}`);
    await expect(page.locator("article header h1")).toContainText(updatedTitle);
    await expect(page.locator(".article-content")).toContainText(
      "这是测试正文",
    );

    await page.goto("/admin/posts");
    const updatedRow = page.getByRole("row", { name: new RegExp(updatedTitle) });
    page.once("dialog", (dialog) => dialog.accept());
    await updatedRow.getByRole("button", { name: "删除" }).click();

    await expect(page).toHaveURL(/\/admin\/posts\?notice=deleted/);
    await expect(page.getByRole("status")).toContainText("文章已删除");
    await expect(page.getByText(updatedTitle)).toHaveCount(0);

    const deletedResponse = await page.goto(`/posts/${slug}`);
    expect(deletedResponse?.status()).toBe(404);
  });
});
