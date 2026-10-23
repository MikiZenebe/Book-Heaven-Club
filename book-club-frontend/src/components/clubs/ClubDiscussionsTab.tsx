import { MessageSquare, UserPlus } from "lucide-react";
import type { ClubDiscussion } from "@/types/book";
import ClubDiscussionCard from "./ClubDiscussionCard";

interface ClubDiscussionsTabProps {
  discussions: ClubDiscussion[];
  isMember: boolean;
  onOpenNewDiscussion: () => void;
  onJoinClub: () => void;
  isJoining: boolean;
}

export default function ClubDiscussionsTab({
  discussions,
  isMember,
  onOpenNewDiscussion,
  onJoinClub,
  isJoining,
}: ClubDiscussionsTabProps) {
  return (
    <section className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2b2420]">
            Salon Discussions
          </h2>
          <p className="mt-1 text-xs text-[#6b5d52]">
            Dialogue, chapter questions, reading impressions, and thematic debate.
          </p>
        </div>

        {isMember && (
          <button
            type="button"
            onClick={onOpenNewDiscussion}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2b2420] px-5 py-3 text-xs font-semibold text-[#f5f0e8] shadow-sm transition-all hover:bg-[#8b4513] hover:shadow-md hover:-translate-y-0.5 shrink-0"
          >
            <MessageSquare size={15} />
            <span>Start a Discussion</span>
          </button>
        )}
      </div>

      {/* Discussion Posts Timeline */}
      {discussions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#2b2420]/15 bg-[#fcfaf7] px-6 py-16 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4a574]/20 text-[#8b4513]">
            <MessageSquare size={30} strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-serif text-2xl font-bold text-[#2b2420]">
            No Discussions Yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-[#6b5d52] leading-relaxed">
            {isMember
              ? "Pose a question about a character, share a striking quote, or start a debate about the reading."
              : "Join this reading circle to take part in salon discussions."}
          </p>
          {isMember ? (
            <button
              type="button"
              onClick={onOpenNewDiscussion}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8b4513] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f] transition-colors"
            >
              <MessageSquare size={15} />
              <span>Start First Discussion</span>
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
        <div className="space-y-4">
          {discussions.map((post) => (
            <ClubDiscussionCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
