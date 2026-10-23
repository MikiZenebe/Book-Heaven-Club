import { useMemo } from "react";
import {
  Users,
  BookOpen,
  MessageSquare,
  Plus,
  LoaderCircle,
  Globe,
  Lock,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import type { BookClub } from "@/types/book";
import { getClubPalette } from "./clubUtils";

interface ClubHeaderProps {
  club: BookClub;
  isMember: boolean;
  booksCount: number;
  discussionsCount: number;
  onOpenAddBook: () => void;
  onOpenNewDiscussion: () => void;
  onJoinClub: () => void;
  isJoining: boolean;
}

export default function ClubHeader({
  club,
  isMember,
  booksCount,
  discussionsCount,
  onOpenAddBook,
  onOpenNewDiscussion,
  onJoinClub,
  isJoining,
}: ClubHeaderProps) {
  const palette = useMemo(() => {
    return getClubPalette(club.id || club.name);
  }, [club]);

  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-[#2b2420]/15 bg-[#ebe3d5]/50 p-7 sm:p-10 shadow-sm">
      {/* Decorative top stripe */}
      <div className={`absolute inset-x-0 top-0 h-2 ${palette.stripe}`} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          {/* Eyebrow & Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                club.visibility === "PRIVATE"
                  ? "border border-amber-300/70 bg-amber-100/80 text-amber-900"
                  : `${palette.badgeBg} ${palette.badgeText}`
              }`}
            >
              {club.visibility === "PRIVATE" ? (
                <>
                  <Lock size={12} strokeWidth={2} />
                  Private Salon
                </>
              ) : (
                <>
                  <Globe size={12} strokeWidth={2} />
                  Public Reading Circle
                </>
              )}
            </span>

            {isMember && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800">
                <CheckCircle2 size={12} className="text-emerald-600" />
                You are a Member
              </span>
            )}
          </div>

          {/* Club Name */}
          <h1 className="mt-3.5 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2b2420] leading-tight">
            {club.name}
          </h1>

          {/* Founder info */}
          {club.owner && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-[#6b5d52]">
              {club.owner.picture ? (
                <img
                  src={club.owner.picture}
                  alt={club.owner.name || "Founder"}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8b4513]/10 text-[10px] font-bold text-[#8b4513]">
                  {(club.owner.name || "C")[0]}
                </div>
              )}
              <span>
                Founded by <strong className="text-[#2b2420]">{club.owner.name || "Reader"}</strong>
              </span>
            </div>
          )}

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b5d52]">
            {club.description ||
              "A dedicated literary salon for book lovers to read together, annotate favorite passages, and share reflections."}
          </p>

          {/* Live Stats Row */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#2b2420]">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#2b2420]/10 bg-white/70 px-3.5 py-2">
              <Users size={14} className="text-[#8b4513]" />
              <span className="font-semibold">{club._count?.members ?? 1}</span>
              <span className="text-[#6b5d52]">Readers</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-[#2b2420]/10 bg-white/70 px-3.5 py-2">
              <BookOpen size={14} className="text-[#8b4513]" />
              <span className="font-semibold">{booksCount}</span>
              <span className="text-[#6b5d52]">Books on Shelf</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-[#2b2420]/10 bg-white/70 px-3.5 py-2">
              <MessageSquare size={14} className="text-[#8b4513]" />
              <span className="font-semibold">{discussionsCount}</span>
              <span className="text-[#6b5d52]">Discussions</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isMember ? (
            <>
              <button
                type="button"
                onClick={onOpenAddBook}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2b2420] px-4.5 py-3 text-xs font-semibold text-[#f5f0e8] shadow-sm transition-all duration-200 hover:bg-[#8b4513] hover:shadow-md hover:-translate-y-0.5"
              >
                <Plus size={15} />
                <span>Add Book</span>
              </button>
              <button
                type="button"
                onClick={onOpenNewDiscussion}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#2b2420]/20 bg-white px-4.5 py-3 text-xs font-semibold text-[#2b2420] shadow-xs transition-all duration-200 hover:border-[#8b4513] hover:text-[#8b4513] hover:-translate-y-0.5"
              >
                <MessageSquare size={15} />
                <span>Start Discussion</span>
              </button>
            </>
          ) : club.visibility === "PUBLIC" ? (
            <button
              type="button"
              disabled={isJoining}
              onClick={onJoinClub}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#8b4513] px-6 py-3.5 font-serif text-sm font-semibold text-[#f5f0e8] shadow-md transition-all duration-200 hover:bg-[#72370f] hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  <span>Joining Circle...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Join Reading Circle</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
              <Lock size={13} />
              <span>Invitation required</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
