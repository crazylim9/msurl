import { supabase } from "@/lib/supabase";
import type { Category, Bookmark } from "@/lib/types";
import ShortenerForm from "./ShortenerForm";
import BookmarkBoard from "./BookmarkBoard";

// Categories/bookmarks are edited at runtime, so this page must not be
// statically prerendered — always fetch fresh data per request.
export const dynamic = "force-dynamic";

async function getCategories(): Promise<Category[]> {
  const [{ data: categories }, { data: bookmarks }] = await Promise.all([
    supabase.from("categories").select("*").order("position", { ascending: true }),
    supabase.from("bookmarks").select("*").order("position", { ascending: true }),
  ]);

  const bookmarksByCategory = new Map<string, Bookmark[]>();
  for (const bookmark of bookmarks ?? []) {
    const list = bookmarksByCategory.get(bookmark.category_id) ?? [];
    list.push(bookmark);
    bookmarksByCategory.set(bookmark.category_id, list);
  }

  return (categories ?? []).map((category) => ({
    ...category,
    bookmarks: bookmarksByCategory.get(category.id) ?? [],
  }));
}

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-green-700">[ ALMOND TREE ] BookMark 2026</h1>
      </header>

      <section className="rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <h2 className="mb-2 text-xs font-semibold text-neutral-500">URL 단축기</h2>
        <ShortenerForm />
      </section>

      <BookmarkBoard initialCategories={categories} />
    </main>
  );
}
