import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAuthorized } from "@/lib/requireAuth";
import { isValidHttpUrl } from "@/lib/slug";

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId : "";
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!categoryId || !label || !isValidHttpUrl(url)) {
    return NextResponse.json(
      { error: "이름과 유효한 http(s) URL을 입력해주세요." },
      { status: 400 }
    );
  }

  const { count } = await supabaseAdmin
    .from("bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  const { data, error } = await supabaseAdmin
    .from("bookmarks")
    .insert({ category_id: categoryId, label, url, position: count ?? 0 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookmark: data });
}
