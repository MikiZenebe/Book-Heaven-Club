import { BookOpen, ExternalLink } from "lucide-react";
import type { ClubBookItem } from "@/types/book";
import { getJacketTheme } from "./clubUtils";

interface ClubBookCardProps {
  book: ClubBookItem;
  variant?: "full" | "compact";
}

export default function ClubBookCard({
  book,
  variant = "full",
}: ClubBookCardProps) {
  const jacket = getJacketTheme(book.title);

  if (variant === "compact") {
    return (
      <article className="group flex gap-3.5 rounded-2xl border border-[#2b2420]/10 bg-white p-4 shadow-2xs transition-all hover:border-[#8b4513]/40 hover:shadow-md">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-24 w-16 shrink-0 rounded-lg object-cover shadow-xs"
          />
        ) : (
          <div
            className={`flex h-24 w-16 shrink-0 flex-col justify-between rounded-lg bg-gradient-to-br ${jacket.gradient} p-2 text-white shadow-xs`}
          >
            <BookOpen size={14} className={jacket.accent} />
            <span className="line-clamp-2 text-[9px] font-serif leading-tight">
              {book.title}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-serif text-base font-bold text-[#2b2420] group-hover:text-[#8b4513] transition-colors truncate">
            {book.title}
          </h4>
          <p className="text-xs text-[#6b5d52] truncate">
            {book.authors?.join(", ") || "Unknown Author"}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#6b5d52]/80">
            <span>Added by {book.addedBy?.name || "Member"}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#8b4513]/40">
      <div>
        {/* Book Cover Container */}
        <div className="relative mb-4 flex h-56 w-full items-center justify-center overflow-hidden rounded-xl border border-[#2b2420]/10 bg-[#ebe3d5]/40 p-2">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              className="h-full max-h-52 rounded-md object-contain shadow-sm transition-transform duration-300 group-hover:scale-102"
            />
          ) : (
            <div
              className={`flex h-48 w-32 flex-col justify-between rounded-lg bg-gradient-to-br ${jacket.gradient} p-4 text-white shadow-md`}
            >
              <BookOpen size={20} className={jacket.accent} />
              <div>
                <p className="font-serif text-sm font-bold leading-tight line-clamp-3">
                  {book.title}
                </p>
                <p className="mt-1 text-[10px] text-white/70 line-clamp-1">
                  {book.authors?.join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Title & Author */}
        <h3 className="font-serif text-xl font-bold leading-snug tracking-tight text-[#2b2420] group-hover:text-[#8b4513] transition-colors">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-[#6b5d52]">
          {book.authors?.join(", ") || "Unknown Author"}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-5 border-t border-[#2b2420]/10 pt-3 flex items-center justify-between text-[11px] text-[#6b5d52]">
        <div className="flex items-center gap-1.5 truncate">
          <span>Added by {book.addedBy?.name || "Member"}</span>
        </div>
        {book.openLibraryId && (
          <a
            href={`https://openlibrary.org/works/${book.openLibraryId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8b4513] hover:underline shrink-0"
          >
            <span>Open Library</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </article>
  );
}
