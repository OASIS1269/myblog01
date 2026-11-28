import { NextResponse } from "next/server";

import { incrementPostViews } from "@/server/services/posts";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "缺少文章标识" },
      { status: 400 },
    );
  }

  try {
    const updated = await incrementPostViews(slug);

    return NextResponse.json(
      { ok: updated },
      { status: updated ? 200 : 404 },
    );
  } catch (error) {
    console.error("Increment views failed:", error);
    return NextResponse.json(
      { ok: false, error: "阅读量更新失败" },
      { status: 500 },
    );
  }
}
