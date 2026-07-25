"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordModal from "./PasswordModal";

export default function LoginGate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSubmit(password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
      return null;
    }
    const data = await res.json().catch(() => ({}));
    return data.error ?? "로그인에 실패했습니다.";
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-600 hover:border-neutral-400"
      >
        [ON]
      </button>
      <PasswordModal open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </>
  );
}
