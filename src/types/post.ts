import type { PostStatus, Prisma } from "@/generated/prisma/client";

export const postWithTagsInclude = {
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.PostInclude;

export type PostWithTags = Prisma.PostGetPayload<{
  include: typeof postWithTagsInclude;
}>;

export const postCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  cover: true,
  status: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.PostSelect;

export type PostCard = Prisma.PostGetPayload<{
  select: typeof postCardSelect;
}>;

export type PostWriteInput = {
  title: string;
  summary: string;
  cover: string;
  slug: string;
  tags: string[];
  content: string;
  status: PostStatus;
};

export type PostStatusValue = PostStatus;
