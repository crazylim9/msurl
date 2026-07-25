import { links } from "@/lib/links";
import ShortenerForm from "./ShortenerForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-10 px-4 py-16">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Link Hub</h1>
        <p className="mt-1 text-sm text-neutral-500">
          원하는 사이트로 바로 이동하거나, URL을 단축해서 공유하세요.
        </p>
      </header>

      <section className="flex w-full flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            className="w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-medium shadow-sm transition hover:border-neutral-400"
          >
            {link.label}
          </a>
        ))}
      </section>

      <section className="flex w-full flex-col items-center gap-3 border-t border-neutral-200 pt-8">
        <h2 className="text-sm font-medium text-neutral-500">
          URL 단축기
        </h2>
        <ShortenerForm />
      </section>
    </main>
  );
}
