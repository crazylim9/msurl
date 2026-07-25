"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<string | null>;
};

export default function PasswordModal({ open, onClose, onSubmit }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const err = await onSubmit(password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-lg bg-white p-4 shadow-xl"
      >
        <h3 className="mb-2 text-sm font-semibold text-neutral-800">편집 비밀번호</h3>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-green-600"
          placeholder="비밀번호"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-neutral-300 px-3 py-1 text-xs"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            {loading ? "확인 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}
