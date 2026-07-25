import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomSlug, isValidHttpUrl } from "@/lib/slug";

const RESERVED_SLUGS = new Set(["api", "favicon.ico"]);
const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const targetUrl = typeof body?.url === "string" ? body.url.trim() : "";

  if (!isValidHttpUrl(targetUrl)) {
    return NextResponse.json(
      { error: "유효한 http(s) URL을 입력해주세요." },
      { status: 400 }
    );
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug = randomSlug();
    if (RESERVED_SLUGS.has(slug)) continue;

    const { error } = await supabase
      .from("short_links")
      .insert({ slug, target_url: targetUrl });

    if (!error) {
      return NextResponse.json({ slug });
    }

    // 23505 = unique_violation; retry with a new slug. Any other error is fatal.
    if (error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "짧은 링크 생성에 실패했습니다. 다시 시도해주세요." },
    { status: 500 }
  );
}
