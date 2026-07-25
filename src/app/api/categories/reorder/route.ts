import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAuthorized } from "@/lib/requireAuth";

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds : null;
  if (!orderedIds) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const results = await Promise.all(
    orderedIds.map((id: string, index: number) =>
      supabaseAdmin.from("categories").update({ position: index }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
