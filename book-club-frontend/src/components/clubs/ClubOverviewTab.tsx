import { Users, BookOpen, MessageSquare, Plus } from "lucide-react";
import type { BookClub, ClubBookItem, ClubDiscussion } from "@/types/book";
import ClubBookCard from "./ClubBookCard";
import ClubDiscussionCard from "./ClubDiscussionCard";

interface ClubOverviewTabProps {
  club: BookClub;
  books: ClubBookItem[];
  discussions: ClubDiscussion[];
  isMember: boolean;
  onOpenAddBook: () => void;
  onOpenNewDiscussion: () => void;
  onSwitchTab: (tab: "books" | "discussions") => void;
  currentUserId?: string;
  onDeleteDiscussion?: (id: string) => Promise<void> | void;
}

export default function ClubOverviewTab({
  club,
  books,
  discussions,
  isMember,
  onOpenAddBook,
  onOpenNewDiscussion,
  onSwitchTab,
  currentUserId,
  onDeleteDiscussion,
}: ClubOverviewTabProps) {
  return (
    <div className="space-y-10">
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-5 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b4513]/10 text-[#8b4513]">
            <Users size={18} />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#6b5d52]">
            Circle Community
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-[#2b2420]">
            {club._count?.members ?? 1} readers
          </p>
        </div>

        <div className="rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-5 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b4513]/10 text-[#8b4513]">
            <BookOpen size={18} />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#6b5d52]">
            Reading Shelf
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-[#2b2420]">
            {books.length} {books.length === 1 ? "book" : "books"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-5 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b4513]/10 text-[#8b4513]">
            <MessageSquare size={18} />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#6b5d52]">
            Conversations
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-[#2b2420]">
            {discussions.length} {discussions.length === 1 ? "thread" : "threads"}
          </p>
        </div>
      </div>

      {/* Reading Shelf Preview */}
      <section className="rounded-3xl border border-[#2b2420]/15 bg-[#fcfaf7] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 border-b border-[#2b2420]/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#2b2420]">
              Reading Shelf
            </h3>
            <p className="text-xs text-[#6b5d52]">
              Stories currently on this circle's shared reading table.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isMember && (
              <button
                type="button"
                onClick={onOpenAddBook}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#2b2420]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2b2420] hover:border-[#8b4513] hover:text-[#8b4513] transition-colors"
              >
                <Plus size={13} />
                <span>Add Book</span>
              </button>
            )}
            {books.length > 0 && (
              <button
                type="button"
                onClick={() => onSwitchTab("books")}
                className="text-xs font-semibold text-[#8b4513] hover:underline"
              >
                View All ({books.length}) →
              </button>
            )}
          </div>
        </div>

        {books.length === 0 ? (
          <div className="py-12 text-center text-[#6b5d52]">
            <BookOpen size={30} className="mx-auto text-[#d4a574] opacity-80" />
            <h4 className="mt-3 font-serif text-lg font-bold text-[#2b2420]">
              Shelf is currently empty
            </h4>
            <p className="mt-1 text-xs max-w-sm mx-auto">
              {isMember
                ? "Add the first book your reading circle will embark upon together."
                : "Join this reading circle to view the shelf and suggest books."}
            </p>
            {isMember && (
              <button
                type="button"
                onClick={onOpenAddBook}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#8b4513] px-4 py-2 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f]"
              >
                <Plus size={14} />
                <span>Add First Book</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.slice(0, 3).map((book) => (
              <ClubBookCard key={book.id} book={book} variant="compact" />
            ))}
          </div>
        )}
      </section>

      {/* Salon Conversations Preview */}
      <section className="rounded-3xl border border-[#2b2420]/15 bg-[#fcfaf7] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 border-b border-[#2b2420]/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#2b2420]">
              Latest Salon Conversations
            </h3>
            <p className="text-xs text-[#6b5d52]">
              Fresh thoughts and dialogue from the reading circle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isMember && (
              <button
                type="button"
                onClick={onOpenNewDiscussion}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#2b2420]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2b2420] hover:border-[#8b4513] hover:text-[#8b4513] transition-colors"
              >
                <MessageSquare size={13} />
                <span>New Discussion</span>
              </button>
            )}
            {discussions.length > 0 && (
              <button
                type="button"
                onClick={() => onSwitchTab("discussions")}
                className="text-xs font-semibold text-[#8b4513] hover:underline"
              >
                View All ({discussions.length}) →
              </button>
            )}
          </div>
        </div>

        {discussions.length === 0 ? (
          <div className="py-12 text-center text-[#6b5d52]">
            <MessageSquare size={30} className="mx-auto text-[#d4a574] opacity-80" />
            <h4 className="mt-3 font-serif text-lg font-bold text-[#2b2420]">
              The salon is quiet
            </h4>
            <p className="mt-1 text-xs max-w-sm mx-auto">
              {isMember
                ? "Start the first discussion thread! Share what you think about current chapters."
                : "Join this reading circle to take part in salon discussions."}
            </p>
            {isMember && (
              <button
                type="button"
                onClick={onOpenNewDiscussion}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#8b4513] px-4 py-2 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f]"
              >
                <Plus size={14} />
                <span>Start First Discussion</span>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3.5">
            {discussions.slice(0, 3).map((post) => (
              <ClubDiscussionCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                clubOwnerId={club.ownerId}
                onDelete={onDeleteDiscussion}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
