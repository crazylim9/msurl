import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAuthorized } from "@/lib/requireAuth";

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "카테고리 이름을 입력해주세요." }, { status: 400 });
  }

  const { count } = await supabaseAdmin
    .from("categories")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({ name, position: count ?? 0 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}
