"use client";

import { useState } from "react";

export default function ShortenerForm() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShortUrl(null);
    setCopied(false);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "알 수 없는 오류가 발생했습니다.");
        return;
      }

      setShortUrl(`${window.location.origin}/${data.slug}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          required
          placeholder="https://example.com/very/long/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "생성 중..." : "단축"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {shortUrl && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 truncate text-sm text-blue-600 underline"
          >
            {shortUrl}
          </a>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium hover:bg-neutral-200"
          >
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
      )}
    </div>
  );
}
