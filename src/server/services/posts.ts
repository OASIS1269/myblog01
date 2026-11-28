import { PostStatus, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { buildPostSlug, buildTagSlug } from "@/lib/slug";
import { deriveSummary } from "@/lib/utils";
import {
  postCardSelect,
  postWithTagsInclude,
  type PostCard,
  type PostWithTags,
  type PostWriteInput,
} from "@/types/post";

export const PUBLIC_PAGE_SIZE = 8;
export const ADMIN_PAGE_SIZE = 10;

export type PostListResult<T> = {
  posts: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class PostSlugConflictError extends Error {
  constructor() {
    super("该 URL 别名已被使用");
    this.name = "PostSlugConflictError";
  }
}

export class PostNotFoundError extends Error {
  constructor() {
    super("文章不存在或已被删除");
    this.name = "PostNotFoundError";
  }
}

function buildTagConnections(
  tags: string[],
): Prisma.PostTagCreateWithoutPostInput[] {
  return tags.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { name },
        create: {
          name,
          slug: buildTagSlug(name),
        },
      },
    },
  }));
}

function postData(input: PostWriteInput) {
  return {
    title: input.title,
    summary: input.summary || deriveSummary(input.content),
    cover: input.cover || null,
    content: input.content,
    status: input.status,
  };
}

export async function listPublishedPosts(
  page = 1,
): Promise<PostListResult<PostCard>> {
  const where = {
    status: PostStatus.PUBLISHED,
  } satisfies Prisma.PostWhereInput;

  const total = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PUBLIC_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    skip: (safePage - 1) * PUBLIC_PAGE_SIZE,
    take: PUBLIC_PAGE_SIZE,
    select: postCardSelect,
  });

  return {
    posts,
    total,
    page: safePage,
    pageSize: PUBLIC_PAGE_SIZE,
    totalPages,
  };
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<PostWithTags | null> {
  return prisma.post.findFirst({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
    include: postWithTagsInclude,
  });
}

export async function getPostById(id: string): Promise<PostWithTags | null> {
  return prisma.post.findUnique({
    where: { id },
    include: postWithTagsInclude,
  });
}

export async function listAdminPosts(params: {
  q?: string;
  status?: "DRAFT" | "PUBLISHED";
  page?: number;
}): Promise<PostListResult<PostCard>> {
  const requestedPage = Math.max(1, params.page ?? 1);
  const where: Prisma.PostWhereInput = {};

  if (params.q) {
    where.title = {
      contains: params.q,
      mode: "insensitive",
    };
  }

  if (params.status) {
    where.status = params.status;
  }

  const total = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    select: postCardSelect,
  });

  return {
    posts,
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    totalPages,
  };
}

export async function createPost(
  input: PostWriteInput,
): Promise<PostWithTags> {
  const slug = buildPostSlug(input.title, input.slug);
  const existing = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    throw new PostSlugConflictError();
  }

  return prisma.post.create({
    data: {
      ...postData(input),
      slug,
      publishedAt: input.status === PostStatus.PUBLISHED ? new Date() : null,
      tags: {
        create: buildTagConnections(input.tags),
      },
    },
    include: postWithTagsInclude,
  });
}

export async function updatePost(
  id: string,
  input: PostWriteInput,
): Promise<PostWithTags> {
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, slug: true, publishedAt: true },
  });

  if (!existing) {
    throw new PostNotFoundError();
  }

  const slug = input.slug
    ? buildPostSlug(input.title, input.slug)
    : existing.slug;

  if (slug !== existing.slug) {
    const slugOwner = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (slugOwner) {
      throw new PostSlugConflictError();
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.postTag.deleteMany({ where: { postId: id } });

    return tx.post.update({
      where: { id },
      data: {
        ...postData(input),
        slug,
        publishedAt:
          existing.publishedAt ??
          (input.status === PostStatus.PUBLISHED ? new Date() : null),
        tags: {
          create: buildTagConnections(input.tags),
        },
      },
      include: postWithTagsInclude,
    });
  });
}

export async function deletePost(
  id: string,
): Promise<{ id: string; slug: string }> {
  return prisma.post.delete({
    where: { id },
    select: { id: true, slug: true },
  });
}

export async function incrementPostViews(slug: string): Promise<boolean> {
  const result = await prisma.post.updateMany({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return result.count > 0;
}

export async function getAdjacentPosts(post: {
  id: string;
  publishedAt: Date | null;
}) {
  if (!post.publishedAt) {
    return { previous: null, next: null };
  }

  const select = {
    slug: true,
    title: true,
  } satisfies Prisma.PostSelect;

  const [previous, next] = await Promise.all([
    prisma.post.findFirst({
      where: {
        id: { not: post.id },
        status: PostStatus.PUBLISHED,
        publishedAt: { lt: post.publishedAt },
      },
      orderBy: { publishedAt: "desc" },
      select,
    }),
    prisma.post.findFirst({
      where: {
        id: { not: post.id },
        status: PostStatus.PUBLISHED,
        publishedAt: { gt: post.publishedAt },
      },
      orderBy: { publishedAt: "asc" },
      select,
    }),
  ]);

  return { previous, next };
}

export async function getDashboardStats() {
  const [total, published, draft, views, recent] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.post.count({ where: { status: PostStatus.DRAFT } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: postCardSelect,
    }),
  ]);

  return {
    total,
    published,
    draft,
    views: views._sum.views ?? 0,
    recent,
  };
}

export async function listPublishedPostsForSitemap() {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
  });
}
