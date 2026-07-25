import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const authorized = isValidSession(cookieStore.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ authorized });
}
