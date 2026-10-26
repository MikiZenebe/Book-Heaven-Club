import { useEffect, useState } from "react";
import { BookOpen, LoaderCircle, Compass, X } from "lucide-react";
import { Link } from "react-router-dom";

import ShelfBookCard from "@/components/books/ShelfBookCard";
import { useShelfStore } from "@/stores/shelfStore";
import type { ReadingStatus, UpdateShelfBookInput } from "@/types/shelf";

type FilterStatus = "ALL" | ReadingStatus;

const FILTER_TABS: { id: FilterStatus; label: string }[] = [
  { id: "ALL", label: "Everything" },
  { id: "WANT_TO_READ", label: "To Read" },
  { id: "CURRENTLY_READING", label: "Reading" },
  { id: "FINISHED", label: "Finished" },
];

export default function MyShelf() {
  // Read the bookshelf data and actions from Zustand.
  const shelfBooks = useShelfStore((state) => state.books);
  const shelfLoading = useShelfStore((state) => state.loading);
  const shelfError = useShelfStore((state) => state.error);

  const loadBookshelf = useShelfStore((state) => state.loadBookshelf);
  const updateBook = useShelfStore((state) => state.updateShelfBook);
  const removeBook = useShelfStore((state) => state.removeShelfBook);

  // Keep page-specific UI state local.
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  // Load the user's bookshelf when this page mounts.
  useEffect(() => {
    void loadBookshelf().catch(() => {
      // The store holds the error displayed by this page.
    });
  }, [loadBookshelf]);

  // Update a book through the Zustand store.
  async function updateShelfBook(
    id: string,
    updates: UpdateShelfBookInput,
  ): Promise<void> {
    setActionError(null);

    try {
      await updateBook(id, updates);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Couldn't update that one.";

      setActionError(message);
      throw error;
    }
  }

  // Remove a book through the Zustand store.
  async function removeShelfBook(id: string): Promise<void> {
    setActionError(null);

    try {
      await removeBook(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Couldn't remove that one.";

      setActionError(message);
      throw error;
    }
  }

  // Calculate counts from the shared bookshelf data.
  const counts: Record<FilterStatus, number> = {
    ALL: shelfBooks.length,
    WANT_TO_READ: shelfBooks.filter((book) => book.status === "WANT_TO_READ")
      .length,
    CURRENTLY_READING: shelfBooks.filter(
      (book) => book.status === "CURRENTLY_READING",
    ).length,
    FINISHED: shelfBooks.filter((book) => book.status === "FINISHED").length,
  };

  const filteredBooks =
    filter === "ALL"
      ? shelfBooks
      : shelfBooks.filter((book) => book.status === filter);

  const readingCount = counts.CURRENTLY_READING;
  const finishedCount = counts.FINISHED;

  return (
    <div className="py-10">
      {/* Page heading */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-8 bg-[#8b4513]" />
        <span className="text-[10px] font-medium tracking-[3px] text-[#8b4513]">
          PERSONAL LIBRARY
        </span>
      </div>

      <h1 className="font-serif text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-tight text-[#2b2420]">
        My Bookshelf
      </h1>

      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#6b5d52]">
        {shelfLoading
          ? "Counting the spines..."
          : shelfBooks.length === 0
            ? "No books yet — but every great library started with one."
            : `${shelfBooks.length} book${shelfBooks.length === 1 ? "" : "s"} collected`}

        {!shelfLoading && shelfBooks.length > 0 && (
          <>
            {" · "}
            {readingCount > 0 && (
              <span className="text-[#c4873a]">
                {readingCount} open right now
              </span>
            )}

            {readingCount > 0 && finishedCount > 0 && " · "}

            {finishedCount > 0 && (
              <span className="text-[#5a7a5a]">{finishedCount} finished</span>
            )}
          </>
        )}
      </p>

      {/* Reading-status filters */}
      {!shelfLoading && shelfBooks.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-1 border-b border-[#2b2420]/10">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id;
            const count = counts[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={active}
                className={`relative flex items-center gap-1.5 px-4 pb-3 pt-2 text-sm transition-colors ${
                  active
                    ? "text-[#2b2420]"
                    : "text-[#6b5d52]/60 hover:text-[#6b5d52]"
                }`}
              >
                {tab.label}

                {count > 0 && (
                  <span
                    className={`text-[10px] ${
                      active ? "text-[#8b4513]" : "text-[#6b5d52]/40"
                    }`}
                  >
                    {count}
                  </span>
                )}

                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#8b4513]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Update/delete errors */}
      {actionError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 border-l-2 border-[#8b4513] bg-[#d4a574]/15 px-4 py-3"
        >
          <span className="font-serif text-lg text-[#8b4513]">!</span>

          <p className="flex-1 text-sm text-[#2b2420]">{actionError}</p>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setActionError(null)}
            className="text-[#6b5d52] hover:text-[#2b2420]"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Loading state */}
      {shelfLoading ? (
        <div
          className="flex min-h-80 flex-col items-center justify-center gap-4"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="animate-spin text-[#8b4513]" size={28} />
          <p className="font-serif text-base italic text-[#6b5d52]">
            dusting off the shelves...
          </p>
        </div>
      ) : shelfError && shelfBooks.length === 0 ? (
        /* Initial load error */
        <div className="mx-auto mt-12 max-w-sm text-center">
          <div className="mx-auto mb-5 inline-block -rotate-3 border-2 border-dashed border-[#8b4513]/30 p-5">
            <BookOpen size={32} className="text-[#8b4513]" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif text-2xl text-[#2b2420]">{shelfError}</h2>

          <p className="mt-3 text-sm leading-relaxed text-[#6b5d52]">
            Your bookshelf lives in the cloud, but it needs to know who you are
            first. Sign in up top and try loading your shelf again.
          </p>

          <button
            type="button"
            onClick={() => {
              void loadBookshelf().catch(() => {});
            }}
            className="mt-6 border-b-2 border-[#2b2420] pb-1 text-sm font-medium text-[#2b2420] transition-colors hover:border-[#8b4513] hover:text-[#8b4513]"
          >
            Try again
          </button>
        </div>
      ) : filteredBooks.length === 0 ? (
        /* Empty shelf or empty filter */
        <div className="mx-auto mt-8 max-w-md py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-sm bg-[#d4a574]/20">
            <BookOpen size={28} className="text-[#8b4513]" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif text-2xl text-[#2b2420]">
            {shelfBooks.length === 0
              ? "This shelf is brand new."
              : "Nothing in this pile yet."}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[#6b5d52]">
            {shelfBooks.length === 0
              ? "Wander the catalog, save what catches your eye, and come back here to keep track."
              : "Switch to a different tab, or go find something new to add."}
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-[#2b2420] pb-1 text-sm font-medium text-[#2b2420] transition-colors hover:border-[#8b4513] hover:text-[#8b4513]"
          >
            <Compass size={15} />
            Go exploring
          </Link>
        </div>
      ) : (
        /* Bookshelf grid */
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-7 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <ShelfBookCard
                key={book.id}
                book={book}
                onUpdate={updateShelfBook}
                onRemove={removeShelfBook}
              />
            ))}
          </div>

          {/* Shelf floor */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#2b2420]/10" />

            <span className="text-[9px] tracking-[2px] text-[#6b5d52]/40">
              END OF SHELF
            </span>

            <div className="h-px flex-1 bg-[#2b2420]/10" />
          </div>
        </div>
      )}
    </div>
  );
}
