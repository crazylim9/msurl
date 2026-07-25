"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Bookmark } from "@/lib/types";

type Props = {
  bookmark: Bookmark;
  editMode: boolean;
  onEdit: (label: string, url: string) => Promise<string | null>;
  onDelete: () => void;
};

export default function BookmarkItem({ bookmark, editMode, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bookmark.id,
    data: { type: "bookmark" },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const [editing, setEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(bookmark.label);
  const [urlDraft, setUrlDraft] = useState(bookmark.url);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = await onEdit(labelDraft.trim(), urlDraft.trim());
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        ref={setNodeRef}
        style={style}
        onSubmit={submit}
        className="flex flex-col gap-1 rounded bg-neutral-50 p-1.5"
      >
        <input
          autoFocus
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1 text-xs"
        />
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1 text-xs"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-1">
          <button
            type="submit"
            className="rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setLabelDraft(bookmark.label);
              setUrlDraft(bookmark.url);
              setError(null);
            }}
            className="rounded border border-neutral-300 px-2 py-0.5 text-xs"
          >
            취소
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-1 rounded px-1 py-1 hover:bg-neutral-50"
    >
      {editMode && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none px-0.5 text-neutral-300 hover:text-neutral-500"
          aria-label="순서 변경"
        >
          ⠿
        </button>
      )}
      {editMode ? (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 truncate text-left text-sm text-neutral-700 hover:underline"
        >
          {bookmark.label}
        </button>
      ) : (
        <a
          href={bookmark.url}
          className="flex-1 truncate text-sm text-neutral-700 hover:text-green-700 hover:underline"
        >
          {bookmark.label}
        </a>
      )}
      {editMode && (
        <button
          onClick={onDelete}
          className="px-0.5 text-neutral-300 hover:text-red-500"
          aria-label="삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
}
