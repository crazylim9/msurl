import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data } = await supabase
    .from("short_links")
    .select("target_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    return NextResponse.redirect(new URL("/?notfound=1", _request.url));
  }

  return NextResponse.redirect(data.target_url);
}
