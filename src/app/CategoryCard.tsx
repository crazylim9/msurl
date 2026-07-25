"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category } from "@/lib/types";
import BookmarkItem from "./BookmarkItem";

type Props = {
  category: Category;
  editMode: boolean;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddBookmark: (categoryId: string, label: string, url: string) => Promise<string | null>;
  onEditBookmark: (
    id: string,
    categoryId: string,
    label: string,
    url: string
  ) => Promise<string | null>;
  onDeleteBookmark: (id: string, categoryId: string) => void;
};

export default function CategoryCard({
  category,
  editMode,
  onRename,
  onDelete,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    data: { type: "category" },
  });
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: category.id,
    data: { type: "category" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [addingBookmark, setAddingBookmark] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [urlDraft, setUrlDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function submitNewBookmark(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const err = await onAddBookmark(category.id, labelDraft.trim(), urlDraft.trim());
    if (err) {
      setFormError(err);
      return;
    }
    setLabelDraft("");
    setUrlDraft("");
    setAddingBookmark(false);
  }

  function submitRename() {
    const name = nameDraft.trim();
    if (name && name !== category.name) onRename(category.id, name);
    else setNameDraft(category.name);
    setRenaming(false);
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-neutral-100 px-3 py-2">
        {editMode && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none px-0.5 text-neutral-300 hover:text-neutral-500"
            aria-label="카테고리 순서 변경"
          >
            ⠿
          </button>
        )}
        {renaming ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") {
                setNameDraft(category.name);
                setRenaming(false);
              }
            }}
            className="flex-1 rounded border border-neutral-300 px-1 py-0.5 text-sm font-semibold"
          />
        ) : (
          <h3
            className={`flex-1 truncate text-sm font-semibold text-neutral-800 ${editMode ? "cursor-text" : ""}`}
            onClick={() => editMode && setRenaming(true)}
          >
            {category.name}
          </h3>
        )}
        {editMode && (
          <button
            onClick={() => onDelete(category.id)}
            className="px-0.5 text-neutral-300 hover:text-red-500"
            aria-label="카테고리 삭제"
          >
            ✕
          </button>
        )}
      </div>

      <div ref={setDroppableRef} className="flex min-h-[2.5rem] flex-col gap-0.5 p-2">
        <SortableContext items={category.bookmarks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {category.bookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              editMode={editMode}
              onEdit={(label, url) => onEditBookmark(bookmark.id, category.id, label, url)}
              onDelete={() => onDeleteBookmark(bookmark.id, category.id)}
            />
          ))}
        </SortableContext>
        {category.bookmarks.length === 0 && !editMode && (
          <p className="px-1 py-1 text-xs text-neutral-300">북마크 없음</p>
        )}
      </div>

      {editMode && (
        <div className="border-t border-neutral-100 p-2">
          {addingBookmark ? (
            <form onSubmit={submitNewBookmark} className="flex flex-col gap-1">
              <input
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                placeholder="이름"
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
              />
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://..."
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
              />
              {formError && <p className="text-xs text-red-500">{formError}</p>}
              <div className="flex gap-1">
                <button
                  type="submit"
                  className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingBookmark(false);
                    setFormError(null);
                  }}
                  className="rounded border border-neutral-300 px-2 py-1 text-xs"
                >
                  취소
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingBookmark(true)}
              className="w-full text-left text-xs text-neutral-400 hover:text-neutral-600"
            >
              + 북마크 추가
            </button>
          )}
        </div>
      )}
    </div>
  );
}
