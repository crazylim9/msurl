import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

export async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSession(cookieStore.get(SESSION_COOKIE)?.value);
}
