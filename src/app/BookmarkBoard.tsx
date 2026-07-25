"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Category } from "@/lib/types";
import CategoryCard from "./CategoryCard";

export default function BookmarkBoard({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editMode, setEditMode] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function findContainer(id: string): string | undefined {
    if (categories.some((c) => c.id === id)) return id;
    return categories.find((c) => c.bookmarks.some((b) => b.id === id))?.id;
  }

  async function persistBookmarkOrder(categoryId: string, orderedIds: string[]) {
    await fetch("/api/bookmarks/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, orderedIds }),
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;
    if (categories.some((c) => c.id === activeIdStr)) return; // category drag: handled on drop only

    const activeContainer = findContainer(activeIdStr);
    const overContainer = findContainer(overIdStr);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setCategories((prev) => {
      const activeCat = prev.find((c) => c.id === activeContainer);
      const overCat = prev.find((c) => c.id === overContainer);
      if (!activeCat || !overCat) return prev;

      const activeIndex = activeCat.bookmarks.findIndex((b) => b.id === activeIdStr);
      if (activeIndex === -1) return prev;
      const overIndex = overCat.bookmarks.findIndex((b) => b.id === overIdStr);

      const movingItem = activeCat.bookmarks[activeIndex];
      const newActiveBookmarks = activeCat.bookmarks.filter((b) => b.id !== activeIdStr);
      const insertAt = overIndex >= 0 ? overIndex : overCat.bookmarks.length;
      const newOverBookmarks = [
        ...overCat.bookmarks.slice(0, insertAt),
        movingItem,
        ...overCat.bookmarks.slice(insertAt),
      ];

      return prev.map((c) => {
        if (c.id === activeContainer) return { ...c, bookmarks: newActiveBookmarks };
        if (c.id === overContainer) return { ...c, bookmarks: newOverBookmarks };
        return c;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (categories.some((c) => c.id === activeIdStr)) {
      if (activeIdStr === overIdStr) return;
      const oldIndex = categories.findIndex((c) => c.id === activeIdStr);
      const newIndex = categories.findIndex((c) => c.id === overIdStr);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(categories, oldIndex, newIndex);
      setCategories(reordered);
      fetch("/api/categories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((c) => c.id) }),
      });
      return;
    }

    const container = findContainer(activeIdStr);
    if (!container) return;
    const cat = categories.find((c) => c.id === container);
    if (!cat) return;

    const oldIndex = cat.bookmarks.findIndex((b) => b.id === activeIdStr);
    const newIndex = cat.bookmarks.findIndex((b) => b.id === overIdStr);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedBookmarks = arrayMove(cat.bookmarks, oldIndex, newIndex);
      setCategories((prev) =>
        prev.map((c) => (c.id === container ? { ...c, bookmarks: reorderedBookmarks } : c))
      );
      persistBookmarkOrder(container, reorderedBookmarks.map((b) => b.id));
    } else {
      // Cross-category move already applied during drag-over; just persist current order.
      persistBookmarkOrder(container, cat.bookmarks.map((b) => b.id));
    }
  }

  function handleEditClick() {
    setEditMode((v) => !v);
  }

  async function addCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const { category } = await res.json();
      setCategories((prev) => [...prev, { ...category, bookmarks: [] }]);
      setNewCategoryName("");
      setAddingCategory(false);
    }
  }

  function renameCategory(id: string, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    fetch(`/api/categories/${id}`, { method: "DELETE" });
  }

  async function addBookmark(categoryId: string, label: string, url: string) {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, label, url }),
    });
    if (res.ok) {
      const { bookmark } = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, bookmarks: [...c.bookmarks, bookmark] } : c))
      );
      return null;
    }
    const data = await res.json().catch(() => ({}));
    return data.error ?? "추가에 실패했습니다.";
  }

  async function editBookmark(id: string, categoryId: string, label: string, url: string) {
    const res = await fetch(`/api/bookmarks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, url }),
    });
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, bookmarks: c.bookmarks.map((b) => (b.id === id ? { ...b, label, url } : b)) }
            : c
        )
      );
      return null;
    }
    const data = await res.json().catch(() => ({}));
    return data.error ?? "수정에 실패했습니다.";
  }

  function deleteBookmark(id: string, categoryId: string) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, bookmarks: c.bookmarks.filter((b) => b.id !== id) } : c
      )
    );
    fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
  }

  const activeBookmark = useMemo(() => {
    if (!activeId) return null;
    for (const c of categories) {
      const b = c.bookmarks.find((b) => b.id === activeId);
      if (b) return b;
    }
    return null;
  }, [activeId, categories]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeId) ?? null,
    [activeId, categories]
  );

  return (
    <div>
      <div className="mb-2 flex justify-end gap-2">
        <button
          onClick={handleEditClick}
          className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-600 hover:border-neutral-400"
        >
          {editMode ? "편집 완료" : "편집"}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={categories.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                editMode={editMode}
                onRename={renameCategory}
                onDelete={deleteCategory}
                onAddBookmark={addBookmark}
                onEditBookmark={editBookmark}
                onDeleteBookmark={deleteBookmark}
              />
            ))}
            {editMode && (
              <div className="rounded-lg border border-dashed border-neutral-300 p-3">
                {addingCategory ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addCategory();
                    }}
                    className="flex flex-col gap-2"
                  >
                    <input
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="카테고리 이름"
                      className="rounded border border-neutral-300 px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white"
                      >
                        추가
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCategory(false);
                          setNewCategoryName("");
                        }}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingCategory(true)}
                    className="w-full text-sm text-neutral-500 hover:text-neutral-700"
                  >
                    + 카테고리 추가
                  </button>
                )}
              </div>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeBookmark ? (
            <div className="rounded bg-white px-2 py-1 text-sm shadow-lg ring-1 ring-neutral-300">
              {activeBookmark.label}
            </div>
          ) : activeCategory ? (
            <div className="w-56 rounded-lg bg-white p-3 text-sm font-semibold shadow-lg ring-1 ring-neutral-300">
              {activeCategory.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {categories.length === 0 && (
        <p className="py-10 text-center text-sm text-neutral-400">
          {editMode ? "위에서 카테고리를 추가해보세요." : "편집 버튼을 눌러 카테고리를 추가해보세요."}
        </p>
      )}
    </div>
  );
}
