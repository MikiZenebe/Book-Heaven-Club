import { useState, useEffect, useCallback, type FormEvent } from "react";
import { X, BookOpen, Plus, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    openLibraryId: string;
    title: string;
    authors: string[];
    coverUrl: string | null;
  }) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

const QUICK_BOOK_SUGGESTIONS = [
  {
    title: "Pride and Prejudice",
    authors: "Jane Austen",
    openLibraryId: "OL45804W",
    coverUrl: "https://covers.openlibrary.org/b/id/8314134-M.jpg",
  },
  {
    title: "1984",
    authors: "George Orwell",
    openLibraryId: "OL1168007W",
    coverUrl: "https://covers.openlibrary.org/b/id/15003502-M.jpg",
  },
  {
    title: "The Great Gatsby",
    authors: "F. Scott Fitzgerald",
    openLibraryId: "OL468516W",
    coverUrl: "https://covers.openlibrary.org/b/id/12818862-M.jpg",
  },
  {
    title: "Frankenstein",
    authors: "Mary Shelley",
    openLibraryId: "OL58079W",
    coverUrl: "https://covers.openlibrary.org/b/id/8231856-M.jpg",
  },
];

export default function AddBookModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  errorMessage,
}: AddBookModalProps) {
  const [openLibraryId, setOpenLibraryId] = useState("");
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setOpenLibraryId("");
    setTitle("");
    setAuthors("");
    setCoverUrl("");
    setLocalError(null);
    onClose();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, handleClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    const trimmedId = openLibraryId.trim();
    const trimmedTitle = title.trim();

    if (!trimmedId) {
      setLocalError("Please provide an Open Library Work ID (e.g. OL45804W).");
      return;
    }
    if (!trimmedTitle) {
      setLocalError("Please enter the book title.");
      return;
    }

    const authorsList = authors
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        openLibraryId: trimmedId,
        title: trimmedTitle,
        authors: authorsList,
        coverUrl: coverUrl.trim() || null,
      });
      handleClose();
    } catch {
      // Parent handles error message
    }
  }

  function applySuggestion(item: (typeof QUICK_BOOK_SUGGESTIONS)[0]) {
    setOpenLibraryId(item.openLibraryId);
    setTitle(item.title);
    setAuthors(item.authors);
    setCoverUrl(item.coverUrl);
  }

  const activeError = localError || errorMessage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-book-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Dimmed backdrop */}
      <div
        onClick={loading ? undefined : handleClose}
        className="fixed inset-0 bg-[#2b2420]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-6 sm:p-8 text-[#2b2420] shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close modal"
          className="absolute right-5 top-5 rounded-full p-2 text-[#6b5d52] transition-colors hover:bg-[#2b2420]/10 hover:text-[#2b2420] disabled:opacity-40"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8b4513]/10 text-[#8b4513] border border-[#8b4513]/20">
            <BookOpen size={22} strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-[2px] text-[#8b4513] uppercase">
              Reading Shelf
            </span>
            <h3
              id="add-book-title"
              className="font-serif text-2xl font-bold tracking-tight text-[#2b2420] sm:text-3xl"
            >
              Add to Reading List
            </h3>
          </div>
        </div>

        <p className="mt-3 text-sm text-[#6b5d52] leading-relaxed">
          Select or enter book details to add to this club's reading shelf so members can read along.
        </p>

        {/* Quick Suggestions */}
        <div className="mt-5 rounded-xl border border-[#2b2420]/10 bg-[#f5f0e8]/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b5d52]">
            <Sparkles size={14} className="text-[#d4a574]" />
            <span>Quick suggestions (click to auto-fill):</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {QUICK_BOOK_SUGGESTIONS.map((item) => (
              <button
                key={item.openLibraryId}
                type="button"
                onClick={() => applySuggestion(item)}
                className="rounded-full border border-[#2b2420]/15 bg-[#fcfaf7] px-2.5 py-1 text-[11px] text-[#2b2420] transition-colors hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-[#f5f0e8]"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {activeError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-300/60 bg-rose-50/90 p-3 text-xs text-rose-800"
          >
            <span className="shrink-0 font-bold">Error:</span>
            <span>{activeError}</span>
          </div>
        )}

        {/* Book Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Open Library ID */}
            <div>
              <label
                htmlFor="book-id"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2b2420]"
              >
                Open Library ID <span className="text-rose-500">*</span>
              </label>
              <input
                id="book-id"
                type="text"
                required
                value={openLibraryId}
                onChange={(e) => setOpenLibraryId(e.target.value)}
                placeholder="e.g. OL45804W"
                className="mt-1.5 w-full rounded-xl border border-[#2b2420]/20 bg-[#ffffff] px-3.5 py-2.5 text-sm text-[#2b2420] placeholder:text-[#6b5d52]/50 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20"
              />
              <span className="mt-1 block text-[10px] text-[#6b5d52]">
                Find the Work ID on openlibrary.org
              </span>
            </div>

            {/* Book Title */}
            <div>
              <label
                htmlFor="book-title"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2b2420]"
              >
                Book Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pride and Prejudice"
                className="mt-1.5 w-full rounded-xl border border-[#2b2420]/20 bg-[#ffffff] px-3.5 py-2.5 text-sm text-[#2b2420] placeholder:text-[#6b5d52]/50 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20"
              />
            </div>
          </div>

          {/* Authors */}
          <div>
            <label
              htmlFor="book-authors"
              className="block text-xs font-semibold uppercase tracking-wider text-[#2b2420]"
            >
              Authors (comma separated)
            </label>
            <input
              id="book-authors"
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Jane Austen, or Author One, Author Two"
              className="mt-1.5 w-full rounded-xl border border-[#2b2420]/20 bg-[#ffffff] px-3.5 py-2.5 text-sm text-[#2b2420] placeholder:text-[#6b5d52]/50 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20"
            />
          </div>

          {/* Cover image URL */}
          <div>
            <label
              htmlFor="book-cover"
              className="block text-xs font-semibold uppercase tracking-wider text-[#2b2420]"
            >
              Cover Image URL (optional)
            </label>
            <div className="mt-1.5 flex gap-3">
              <input
                id="book-cover"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://covers.openlibrary.org/b/id/..."
                className="flex-1 rounded-xl border border-[#2b2420]/20 bg-[#ffffff] px-3.5 py-2.5 text-sm text-[#2b2420] placeholder:text-[#6b5d52]/50 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20"
              />
              {coverUrl.trim() && (
                <div className="h-10 w-8 shrink-0 overflow-hidden rounded border border-[#2b2420]/15 bg-white shadow-2xs">
                  <img
                    src={coverUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-[#2b2420]/10">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="rounded-xl border border-[#2b2420]/20 bg-transparent px-4 py-2.5 text-xs font-semibold text-[#6b5d52] transition-colors hover:bg-[#2b2420]/5 hover:text-[#2b2420] disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !openLibraryId.trim()}
              className="h-auto rounded-xl bg-[#2b2420] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] transition-all hover:bg-[#8b4513] hover:shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin mr-1.5" />
                  Adding to Shelf...
                </>
              ) : (
                <>
                  <Plus size={15} className="mr-1.5" />
                  Add to Reading List
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
