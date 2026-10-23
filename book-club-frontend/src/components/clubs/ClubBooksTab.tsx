import { BookOpen, Plus, UserPlus } from "lucide-react";
import type { ClubBookItem } from "@/types/book";
import ClubBookCard from "./ClubBookCard";

interface ClubBooksTabProps {
  books: ClubBookItem[];
  isMember: boolean;
  onOpenAddBook: () => void;
  onJoinClub: () => void;
  isJoining: boolean;
}

export default function ClubBooksTab({
  books,
  isMember,
  onOpenAddBook,
  onJoinClub,
  isJoining,
}: ClubBooksTabProps) {
  return (
    <section className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2b2420]">
            Club Reading List
          </h2>
          <p className="mt-1 text-xs text-[#6b5d52]">
            The complete library of books selected for reading, annotation, and discussion.
          </p>
        </div>

        {isMember && (
          <button
            type="button"
            onClick={onOpenAddBook}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2b2420] px-5 py-3 text-xs font-semibold text-[#f5f0e8] shadow-sm transition-all hover:bg-[#8b4513] hover:shadow-md hover:-translate-y-0.5 shrink-0"
          >
            <Plus size={15} />
            <span>Add Book to Shelf</span>
          </button>
        )}
      </div>

      {/* Books List Grid */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#2b2420]/15 bg-[#fcfaf7] px-6 py-16 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4a574]/20 text-[#8b4513]">
            <BookOpen size={30} strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-serif text-2xl font-bold text-[#2b2420]">
            No Books on the Shelf Yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-[#6b5d52] leading-relaxed">
            {isMember
              ? "Every great reading club begins with a single title. Add a book to invite members to read together."
              : "Join this reading circle to view its reading list and propose books."}
          </p>
          {isMember ? (
            <button
              type="button"
              onClick={onOpenAddBook}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8b4513] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f] transition-colors"
            >
              <Plus size={15} />
              <span>Add First Book</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isJoining}
              onClick={onJoinClub}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8b4513] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f] transition-colors"
            >
              <UserPlus size={15} />
              <span>Join Reading Circle</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <ClubBookCard key={book.id} book={book} variant="full" />
          ))}
        </div>
      )}
    </section>
  );
}
