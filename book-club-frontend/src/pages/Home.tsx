import { useState, useEffect, type FormEvent } from "react";
import {
  BookOpen,
  Search,
  LoaderCircle,
  Quote,
  Coffee,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/constants/baseUrl";
import BookCard from "@/components/books/BookCard";
import type { BookItem } from "@/types/book";
import { useBookStore } from "@/stores/bookStore";

const SHELF_PICKS = [
  { label: "Cozy mysteries", emoji: "🔎" },
  { label: "Slow mornings", emoji: "☕" },
  { label: "Lost classics", emoji: "📜" },
  { label: "Soft sci-fi", emoji: "🌌" },
  { label: "Memoirs", emoji: "✍️" },
];

export default function HomePage() {
  const query = useBookStore((state) => state.query);
  const books = useBookStore((state) => state.books);
  const loading = useBookStore((state) => state.loading);
  const error = useBookStore((state) => state.error);
  const searched = useBookStore((state) => state.searched);

  const setQuery = useBookStore((state) => state.setQuery);
  const runBookSearch = useBookStore((state) => state.searchBooks);
  const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Load existing shelf book IDs so saved status is accurately displayed
  useEffect(() => {
    fetch(`${API_BASE_URL}/bookshelf`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = new Set<string>(
            data
              .map((b: { openLibraryId?: string }) => b.openLibraryId)
              .filter((id): id is string => Boolean(id)),
          );
          setSavedBookIds(ids);
        }
      })
      .catch(() => {
        // Shelf fetch is best-effort (e.g. user may not be signed in yet)
      });
  }, []);

  async function searchBooks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runBookSearch();
  }

  function quickSearch(term: string) {
    void runBookSearch(term);
  }

  async function saveBook(book: BookItem) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookshelf`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openLibraryId: book.id,
          title: book.title,
          authors: book.authors,
          coverUrl: book.coverUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Sign in with Google in the top bar to save books to your shelf.",
          );
        }
        throw new Error(data.message || "Could not save this book.");
      }

      setSavedBookIds((prev) => new Set(prev).add(book.id));
      setToast({
        text: `"${book.title}" added to your shelf!`,
        type: "success",
      });
      setTimeout(() => setToast(null), 3500);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Something went wrong.";
      setToast({
        text: msg,
        type: "error",
      });
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div id="discover">
      {/* Hero */}
      <section className="relative grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:py-20">
        <div className="relative z-10">
          {/* Hand-written style tag */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-10 bg-[#8b4513]" />
            <span className="text-xs italic text-[#8b4513]">
              est. for readers, by readers
            </span>
          </div>

          <h1 className="font-serif text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight">
            Books that{" "}
            <span className="relative inline-block">
              <span className="italic text-[#8b4513]">stay</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M2,5 Q25,1 50,4 T98,3"
                  stroke="#d4a574"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            with you{" "}
            <span className="font-light text-[#6b5d52]">long after</span>
            <br />
            the last page.
          </h1>

          <p className="mt-8 max-w-115 text-base leading-relaxed text-[#6b5d52]">
            No algorithms shouting at you. No bestseller lists. Just a quiet
            corner of the internet where you can wander, discover, and keep
            track of what moves you.
          </p>

          {/* Search */}
          <form
            onSubmit={searchBooks}
            className="mt-10 flex max-w-135 items-center gap-3 border-b-2 border-[#2b2420] pb-3"
          >
            <Search size={20} className="shrink-0 text-[#6b5d52]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you in the mood for?"
              className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-1 text-base placeholder:text-[#6b5d52]/50 shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-10 shrink-0 rounded-none bg-[#2b2420] px-5 text-sm font-normal text-[#f5f0e8] hover:bg-[#8b4513]"
            >
              {loading ? "Looking..." : "Find it →"}
            </Button>
          </form>

          {/* Quick chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6b5d52]">try:</span>
            {SHELF_PICKS.map((pick) => (
              <button
                key={pick.label}
                onClick={() => quickSearch(pick.label)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-[#2b2420]/20 bg-[#f5f0e8] px-3 py-1.5 text-xs text-[#2b2420] transition-all hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-[#f5f0e8]"
              >
                <span>{pick.emoji}</span>
                {pick.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right side - editorial collage */}
        <div className="relative hidden min-h-125 lg:block">
          {/* Big quote card */}
          <div className="absolute right-0 top-4 w-70 rotate-2 bg-[#2b2420] p-7 text-[#f5f0e8] shadow-xl">
            <Quote size={24} className="text-[#d4a574]" />
            <p className="mt-4 font-serif text-lg leading-snug italic">
              "A reader lives a thousand lives before he dies."
            </p>
            <p className="mt-4 text-[10px] tracking-[2px] text-[#d4a574]">
              — GEORGE R.R. MARTIN
            </p>
          </div>

          {/* Book spine stack */}
          <div className="absolute left-2 top-32 flex -rotate-6 flex-col gap-1 shadow-2xl">
            <div className="flex h-12 w-55 items-center bg-[#8b4513] px-5 font-serif text-sm text-[#f5f0e8]">
              The Hidden Life of Trees
            </div>
            <div className="flex h-10 w-55 items-center bg-[#d4a574] px-5 font-serif text-sm text-[#2b2420]">
              Pachinko · Min Jin Lee
            </div>
            <div className="flex h-14 w-55 items-center bg-[#4a5d4a] px-5 font-serif text-base text-[#f5f0e8]">
              Braiding Sweetgrass
            </div>
            <div className="flex h-11 w-55 items-center bg-[#f5f0e8] border-y-2 border-[#2b2420] px-5 font-serif text-sm text-[#2b2420]">
              Normal People
            </div>
            <div className="flex h-10 w-55 items-center bg-[#6b5d52] px-5 font-serif text-sm text-[#f5f0e8]">
              A Little Life
            </div>
          </div>

          {/* Polaroid-style note */}
          <div className="absolute bottom-8 right-6 w-50 rotate-[-4deg] bg-[#f5f0e8] p-3 pb-10 shadow-xl ring-1 ring-[#2b2420]/10">
            <div className="flex h-32.5 items-center justify-center bg-[#d4a574]/30">
              <Coffee size={40} className="text-[#8b4513]" strokeWidth={1.5} />
            </div>
            <p className="mt-3 text-center font-serif text-sm italic text-[#2b2420]">
              sunday reading list ♡
            </p>
          </div>

          {/* Tape element */}
          <div className="absolute left-16 top-20 h-5 w-20 rotate-25 bg-[#d4a574]/40" />
        </div>
      </section>

      {/* Divider with label */}
      <div className="flex items-center gap-4 border-t border-[#2b2420]/15">
        <span className="-mt-3 bg-[#f5f0e8] pr-4 text-[10px] font-medium tracking-[3px] text-[#6b5d52]">
          {searched ? "WHAT WE FOUND" : "ON THE TABLE"}
        </span>
        <div className="h-px flex-1" />
      </div>

      {/* Results */}
      <section className="py-12">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">
              {searched ? (
                <>
                  Here's what the shelf <br />
                  <em className="text-[#8b4513]">whispered back.</em>
                </>
              ) : (
                <>
                  Not sure where <br />
                  to <em className="text-[#8b4513]">begin?</em>
                </>
              )}
            </h2>
          </div>
          {books.length > 0 && (
            <div className="hidden text-right sm:block">
              <div className="font-serif text-3xl text-[#8b4513]">
                {books.length}
              </div>
              <div className="text-[10px] tracking-[2px] text-[#6b5d52]">
                {books.length === 1 ? "FINDING" : "FINDINGS"}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 flex items-start gap-3 border-l-2 border-[#8b4513] bg-[#d4a574]/20 p-4">
            <span className="font-serif text-xl text-[#8b4513]">!</span>
            <p className="text-sm text-[#2b2420]">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-75 flex-col items-center justify-center gap-4 text-[#6b5d52]">
            <LoaderCircle className="animate-spin text-[#8b4513]" size={32} />
            <p className="font-serif text-lg italic">
              pulling books off the shelf...
            </p>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isSaved={savedBookIds.has(book.id)}
                onSave={saveBook}
              />
            ))}
          </div>
        ) : (
          <div className="relative mx-auto max-w-md py-16 text-center">
            <div className="mb-6 inline-block rotate-[-5deg] border-2 border-dashed border-[#8b4513]/40 p-5">
              <BookOpen
                size={36}
                className="text-[#8b4513]"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="font-serif text-2xl text-[#2b2420]">
              {searched
                ? "The shelf came up empty."
                : "Every great read starts with a search."}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6b5d52]">
              {searched
                ? "Try something else — maybe a mood, a decade, or a half-remembered name."
                : "Type something above, or borrow one of our suggestions."}
            </p>
          </div>
        )}
      </section>

      {/* Floating Save Notification Toast */}
      {toast && (
        <aside
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-4 text-[#2b2420] shadow-2xl backdrop-blur-xl"
        >
          {toast.type === "success" ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 size={18} />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <AlertCircle size={18} />
            </div>
          )}
          <p className="text-xs font-medium leading-relaxed">{toast.text}</p>
        </aside>
      )}
    </div>
  );
}
