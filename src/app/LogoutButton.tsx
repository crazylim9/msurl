"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-600 hover:border-neutral-400"
    >
      [OFF]
    </button>
  );
}
