import { useState } from "react";
import { Clock, Trash2, LoaderCircle } from "lucide-react";
import type { ClubDiscussion } from "@/types/book";
import { formatClubTime } from "./clubUtils";

interface ClubDiscussionCardProps {
  post: ClubDiscussion;
  canDelete?: boolean;
  currentUserId?: string;
  clubOwnerId?: string;
  onDelete?: (id: string) => Promise<void> | void;
}

export default function ClubDiscussionCard({
  post,
  canDelete,
  currentUserId,
  clubOwnerId,
  onDelete,
}: ClubDiscussionCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDeletable =
    canDelete ??
    Boolean(
      onDelete &&
        currentUserId &&
        (post.user.id === currentUserId ||
          (clubOwnerId && clubOwnerId === currentUserId)),
    );

  async function handleDelete() {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch {
      setIsDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <article className="group rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-5 sm:p-6 shadow-2xs transition-all hover:border-[#2b2420]/30">
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

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[#6b5d52]/80">
            <Clock size={12} />
            {formatClubTime(post.createdAt)}
          </span>

          {isDeletable && (
            <div className="flex items-center">
              {confirming ? (
                <div className="flex items-center gap-1.5 text-xs animate-in fade-in duration-150">
                  <span className="text-[11px] font-medium text-rose-700">Delete?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <LoaderCircle size={11} className="inline animate-spin" />
                    ) : (
                      "Yes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={isDeleting}
                    className="rounded px-1.5 py-0.5 text-[11px] text-[#6b5d52] transition-colors hover:bg-[#2b2420]/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  disabled={isDeleting}
                  title="Delete discussion"
                  aria-label="Delete discussion"
                  className="rounded-lg p-1 text-[#6b5d52]/50 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#2b2420] whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
