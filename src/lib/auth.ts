import crypto from "crypto";

export const SESSION_COOKIE = "edit_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sign(expiresAt: number): string {
  const secret = process.env.EDIT_PASSWORD;
  if (!secret) throw new Error("EDIT_PASSWORD is not set");
  return crypto.createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
}

export function createSessionValue(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSession(value: string | undefined | null): boolean {
  if (!value) return false;
  const [expiresAtStr, sig] = value.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || !sig || Date.now() > expiresAt) return false;

  const expected = sign(expiresAt);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
