import { LoaderCircle, X } from "lucide-react";
import StatusToggle from "../StatusToggle";
import BookCard from "./BookCard";
import StarRating from "../StarRating";
import type { BookItem } from "@/types/book";
import { useState } from "react";
import type { ShelfBook } from "@/types/shelf";

interface ShelfBookCardProps {
  book: ShelfBook;
  onUpdate: (
    id: string,
    updates: {
      status?: ShelfBook["status"];
      rating?: number | null;
      notes?: string | null;
    },
  ) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export default function ShelfBookCard({
  book,
  onUpdate,
  onRemove,
}: ShelfBookCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const busy = isUpdating || isRemoving;

  const item: BookItem = {
    id: book.openLibraryId || book.id,
    title: book.title,
    authors: book.authors,
    coverUrl: book.coverUrl,
    status: book.status,
    rating: book.rating,
    notes: book.notes,
  };

  async function handleStatus(status: ShelfBook["status"]) {
    if (status === book.status) return;
    setIsUpdating(true);
    try {
      await onUpdate(book.id, { status });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRating(rating: number | null) {
    setIsUpdating(true);
    try {
      await onUpdate(book.id, { rating });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await onRemove(book.id);
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="group relative">
      <BookCard
        book={item}
        isSaved
        showBookmark={false}
        className="w-full max-w-sm mx-auto"
        footerSlot={
          <div className="space-y-2.5 border-t border-dashed border-[#2b2420]/10 pt-2.5">
            {/* Status */}
            <StatusToggle
              value={book.status}
              onChange={handleStatus}
              disabled={busy}
            />

            {/* Rating and remove actions */}
            <div className="flex items-center justify-between pt-0.5">
              <StarRating
                value={book.rating}
                onChange={handleRating}
                disabled={busy}
              />

              <button
                type="button"
                disabled={busy}
                onClick={handleRemove}
                className="flex items-center gap-1 text-[11px] text-[#6b5d52]/60 transition-colors hover:text-[#8b4513] disabled:opacity-40"
              >
                {isRemoving ? (
                  <LoaderCircle size={11} className="animate-spin" />
                ) : (
                  <X size={11} />
                )}
                {isRemoving ? "removing..." : "remove"}
              </button>
            </div>
          </div>
        }
      />

      {/* Busy overlay */}
      {isUpdating && !isRemoving && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#f5f0e8]/60 backdrop-blur-[1px]">
          <LoaderCircle size={18} className="animate-spin text-[#8b4513]" />
        </div>
      )}
    </div>
  );
}
