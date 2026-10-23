import { Clock } from "lucide-react";
import type { ClubDiscussion } from "@/types/book";
import { formatClubTime } from "./clubUtils";

interface ClubDiscussionCardProps {
  post: ClubDiscussion;
}

export default function ClubDiscussionCard({
  post,
}: ClubDiscussionCardProps) {
  return (
    <article className="rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-5 sm:p-6 shadow-2xs transition-all hover:border-[#2b2420]/30">
      <div className="flex items-center justify-between gap-3 border-b border-[#2b2420]/10 pb-3">
        <div className="flex items-center gap-3">
          {post.user.picture ? (
            <img
              src={post.user.picture}
              alt={post.user.name || "Reader"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b4513]/10 text-xs font-bold text-[#8b4513]">
              {(post.user.name || "R")[0]}
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-[#2b2420]">
              {post.user.name || "Reader"}
            </h4>
            <span className="text-[10px] text-[#6b5d52]">Member</span>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[#6b5d52]/80">
          <Clock size={12} />
          {formatClubTime(post.createdAt)}
        </span>
      </div>
      <div className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#2b2420] whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
