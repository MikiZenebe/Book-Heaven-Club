import {
  Users,
  BookOpen,
  Globe,
  Lock,
  UserPlus,
  Check,
  MessageSquare,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import type { BookClub } from "@/types/book";
import { Link } from "react-router-dom";

interface ClubCardProps {
  club: BookClub;
  isMember: boolean;
  onJoin?: (clubId: string) => Promise<void> | void;
  isJoining?: boolean;
}

const CLUB_PALETTES = [
  {
    stripe: "bg-[#8b4513]",
    badgeBg: "bg-[#8b4513]/10",
    badgeText: "text-[#8b4513]",
    borderHover: "hover:border-[#8b4513]/40",
    glow: "from-[#8b4513]/5",
  },
  {
    stripe: "bg-[#4a5d4a]",
    badgeBg: "bg-[#4a5d4a]/10",
    badgeText: "text-[#4a5d4a]",
    borderHover: "hover:border-[#4a5d4a]/40",
    glow: "from-[#4a5d4a]/5",
  },
  {
    stripe: "bg-[#1e3a5f]",
    badgeBg: "bg-[#1e3a5f]/10",
    badgeText: "text-[#1e3a5f]",
    borderHover: "hover:border-[#1e3a5f]/40",
    glow: "from-[#1e3a5f]/5",
  },
  {
    stripe: "bg-[#6b2d5c]",
    badgeBg: "bg-[#6b2d5c]/10",
    badgeText: "text-[#6b2d5c]",
    borderHover: "hover:border-[#6b2d5c]/40",
    glow: "from-[#6b2d5c]/5",
  },
  {
    stripe: "bg-[#a2682a]",
    badgeBg: "bg-[#a2682a]/10",
    badgeText: "text-[#a2682a]",
    borderHover: "hover:border-[#a2682a]/40",
    glow: "from-[#a2682a]/5",
  },
];

function getClubPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CLUB_PALETTES.length;
  return CLUB_PALETTES[index];
}

export default function ClubCard({
  club,
  isMember,
  onJoin,
  isJoining = false,
}: ClubCardProps) {
  const palette = getClubPalette(club.id || club.name);
  const memberCount = club._count?.members ?? 1;
  const bookCount = club._count?.books ?? 0;
  const isPrivate = club.visibility === "PRIVATE";

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#2b2420]/15 bg-[#fcfaf7] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${palette.borderHover}`}
    >
      {/* Decorative top color stripe resembling an embossed book binding */}
      <div className={`absolute inset-x-0 top-0 h-1.5 ${palette.stripe}`} />

      {/* Top badges row */}
      <div>
        <div className="flex items-center justify-between gap-2">
          {/* Visibility tag */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              isPrivate
                ? "bg-amber-100/70 text-amber-900 border border-amber-300/60"
                : `${palette.badgeBg} ${palette.badgeText}`
            }`}
          >
            {isPrivate ? (
              <>
                <Lock size={11} strokeWidth={2} />
                Private
              </>
            ) : (
              <>
                <Globe size={11} strokeWidth={2} />
                Public Circle
              </>
            )}
          </span>

          {/* Member status pill */}
          {isMember && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-800">
              <Check size={11} strokeWidth={2.5} />
              Member
            </span>
          )}
        </div>

        {/* Club Title */}
        <h4 className="mt-4 font-serif text-2xl font-bold leading-snug tracking-tight text-[#2b2420] transition-colors group-hover:text-[#8b4513]">
          {club.name}
        </h4>

        {/* Club Owner / Founder info if present */}
        {club.owner && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#6b5d52]">
            {club.owner.picture ? (
              <img
                src={club.owner.picture}
                alt={club.owner.name || "Founder"}
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2b2420]/10 text-[9px] font-semibold text-[#2b2420]">
                {(club.owner.name || "C")[0]}
              </div>
            )}
            <span className="truncate">
              Founded by {club.owner.name || "Reader"}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-[#6b5d52]">
          {club.description ||
            "A welcoming circle of fellow readers meeting regularly to discover and discuss great books."}
        </p>
      </div>

      {/* Bottom stats and action bar */}
      <div className="mt-6 border-t border-[#2b2420]/10 pt-4">
        {/* Readers and Books counters */}
        <div className="flex items-center justify-between text-xs text-[#6b5d52]">
          <div className="flex items-center gap-1.5 font-medium">
            <Users size={14} className="text-[#8b4513]" />
            <span>
              {memberCount} {memberCount === 1 ? "reader" : "readers"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <BookOpen size={14} className="text-[#8b4513]" />
            <span>
              {bookCount} {bookCount === 1 ? "book" : "books"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {/* Join / Status Button */}
          {isMember ? (
            <Link
              to={`/clubs/${club.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#2b2420]/20 bg-white py-2 px-3 text-xs font-semibold text-[#2b2420] transition-colors hover:border-[#8b4513] hover:text-[#8b4513]"
            >
              <MessageSquare size={14} />
              Open Salon
            </Link>
          ) : isPrivate ? (
            <button
              type="button"
              disabled
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#2b2420]/10 bg-[#f5f0e8] py-2 px-3 text-xs font-medium text-[#6b5d52] opacity-75"
            >
              <Lock size={13} />
              Invitation Only
            </button>
          ) : (
            <button
              type="button"
              disabled={isJoining}
              onClick={() => onJoin?.(club.id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8b4513] py-2 px-3 text-xs font-semibold text-[#f5f0e8] transition-all hover:bg-[#72370f] hover:shadow-sm disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <LoaderCircle size={14} className="animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Join Club
                </>
              )}
            </button>
          )}

          {/* Details / Discussions trigger button */}
          <Link
            to={`/clubs/${club.id}`}
            aria-label={`View ${club.name} details`}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-[#2b2420]/15 bg-white text-[#6b5d52] transition-colors hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-[#f5f0e8]"
          >
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
