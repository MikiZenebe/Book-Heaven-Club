import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  X,
  Sparkles,
  Globe,
  Lock,
  LoaderCircle,
  BookOpen,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    visibility: "PUBLIC" | "PRIVATE";
  }) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

const INSPIRATION_THEMES = [
  {
    label: "Classic Literature",
    desc: "Exploring timeless literary masterpieces",
  },
  {
    label: "Sci-Fi & Speculative",
    desc: "Distant worlds, future technologies, and cosmic wonders",
  },
  {
    label: "Cozy Mystery Circle",
    desc: "Page-turning whodunits and tea-sipping detectives",
  },
  {
    label: "Non-Fiction & Memoirs",
    desc: "Fascinating true stories, biographies, and essays",
  },
  {
    label: "Modern Literary Fiction",
    desc: "Contemporary voices and award-winning fiction",
  },
];

export default function CreateClubModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  errorMessage,
}: CreateClubModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setName("");
    setDescription("");
    setVisibility("PUBLIC");
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

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Please give your club a name.");
      return;
    }
    if (trimmedName.length > 80) {
      setLocalError("Club name must be 80 characters or fewer.");
      return;
    }
    if (description.length > 1000) {
      setLocalError("Description must be 1000 characters or fewer.");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        visibility,
      });
    } catch {
      // Parent handles error message
    }
  }

  function applyInspiration(theme: (typeof INSPIRATION_THEMES)[0]) {
    if (!name) setName(`${theme.label} Society`);
    setDescription(theme.desc);
  }

  const activeError = localError || errorMessage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-club-title"
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
            <Users size={22} strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-[2px] text-[#8b4513] uppercase">
              New Reading Circle
            </span>
            <h3
              id="create-club-title"
              className="font-serif text-2xl font-bold tracking-tight text-[#2b2420] sm:text-3xl"
            >
              Create a Book Club
            </h3>
          </div>
        </div>

        <p className="mt-3 text-sm text-[#6b5d52] leading-relaxed">
          Establish a dedicated reading space to share books, discuss chapter
          highlights, and explore great writing together.
        </p>

        {/* Quick Inspiration Pills */}
        <div className="mt-5 rounded-xl border border-[#2b2420]/10 bg-[#f5f0e8]/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b5d52]">
            <Sparkles size={14} className="text-[#d4a574]" />
            <span>Need inspiration? Click a theme:</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {INSPIRATION_THEMES.map((theme) => (
              <button
                key={theme.label}
                type="button"
                onClick={() => applyInspiration(theme)}
                className="rounded-full border border-[#2b2420]/15 bg-[#fcfaf7] px-2.5 py-1 text-[11px] text-[#2b2420] transition-colors hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-[#f5f0e8]"
              >
                {theme.label}
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

        {/* Club Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Club Name */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="club-name"
                className="text-xs font-semibold tracking-wider uppercase text-[#2b2420]"
              >
                Club Name <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[#6b5d52]/80">
                {name.length}/80
              </span>
            </div>
            <div className="relative mt-1.5">
              <input
                id="club-name"
                type="text"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midnight Pages Society, The Sci-Fi Guild"
                className="w-full rounded-xl border border-[#2b2420]/20 bg-[#ffffff] px-3.5 py-2.5 text-sm text-[#2b2420] placeholder:text-[#6b5d52]/50 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="club-description"
                className="text-xs font-semibold tracking-wider uppercase text-[#2b2420]"
              >
                Description & Reading Focus
              </label>
              <span className="text-[11px] text-[#6b5d52]/80">
                {description.length}/1000
              </span>
            </div>
            <textarea
              id="club-description"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What genres or reading rhythms define this group? What should new members expect?"
              className="mt-1.5 w-full rounded-xl border border-[#2b2420]/20 bg-[#ffffff] p-3 text-sm text-[#2b2420] placeholder:text-[#6b5d52]/50 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20 resize-none"
            />
          </div>

          {/* Visibility Choice */}
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#2b2420]">
              Club Access
            </span>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  visibility === "PUBLIC"
                    ? "border-[#8b4513] bg-[#8b4513]/5 ring-1 ring-[#8b4513]"
                    : "border-[#2b2420]/15 bg-white hover:border-[#2b2420]/30"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === "PUBLIC"}
                  onChange={() => setVisibility("PUBLIC")}
                  className="sr-only"
                />
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    visibility === "PUBLIC"
                      ? "bg-[#8b4513] text-white"
                      : "bg-[#f5f0e8] text-[#6b5d52]"
                  }`}
                >
                  <Globe size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#2b2420]">
                    Public Circle
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6b5d52]">
                    Listed on Discover; any member can join and read along.
                  </div>
                </div>
              </label>

              <label
                className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  visibility === "PRIVATE"
                    ? "border-[#8b4513] bg-[#8b4513]/5 ring-1 ring-[#8b4513]"
                    : "border-[#2b2420]/15 bg-white hover:border-[#2b2420]/30"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")}
                  className="sr-only"
                />
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    visibility === "PRIVATE"
                      ? "bg-[#8b4513] text-white"
                      : "bg-[#f5f0e8] text-[#6b5d52]"
                  }`}
                >
                  <Lock size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#2b2420]">
                    Private Circle
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6b5d52]">
                    Invite-only group for book club friends and private salons.
                  </div>
                </div>
              </label>
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
              disabled={loading || !name.trim()}
              className="h-auto rounded-xl bg-[#2b2420] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] transition-all hover:bg-[#8b4513] hover:shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin mr-1.5" />
                  Founding Circle...
                </>
              ) : (
                <>
                  <BookOpen size={15} className="mr-1.5" />
                  Found Book Club
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
