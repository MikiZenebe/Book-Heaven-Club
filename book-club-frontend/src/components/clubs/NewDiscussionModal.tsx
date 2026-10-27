import { useState, useEffect, useCallback, type FormEvent } from "react";
import { X, MessageSquare, Send, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  clubName?: string;
}

const CONVERSATION_STARTERS = [
  "What were your initial reactions to the opening chapters?",
  "Which quote or passage stood out to you the most?",
  "How did you feel about the main character's choices?",
  "Themes & symbolism we noticed in our reading:",
];

export default function NewDiscussionModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  errorMessage,
  clubName,
}: NewDiscussionModalProps) {
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setContent("");
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

    const trimmed = content.trim();
    if (!trimmed) {
      setLocalError(
        "Please write a thought or question to start the discussion.",
      );
      return;
    }
    if (trimmed.length > 2000) {
      setLocalError("Message must be 2000 characters or fewer.");
      return;
    }

    try {
      await onSubmit(trimmed);
      handleClose();
    } catch {
      // Parent handles error message
    }
  }

  function applyStarter(starter: string) {
    if (!content.trim()) {
      setContent(starter + "\n\n");
    } else {
      setContent((prev) => prev + "\n" + starter + " ");
    }
  }

  const activeError = localError || errorMessage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-discussion-title"
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
            <MessageSquare size={22} strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-[2px] text-[#8b4513] uppercase">
              {clubName ? `${clubName} Salon` : "Salon Discussion"}
            </span>
            <h3
              id="new-discussion-title"
              className="font-serif text-2xl font-bold tracking-tight text-[#2b2420] sm:text-3xl"
            >
              Start a Discussion
            </h3>
          </div>
        </div>

        <p className="mt-3 text-sm text-[#6b5d52] leading-relaxed">
          Share reflections, pose questions, or discuss key moments with fellow
          reading circle members.
        </p>

        {/* Conversation Starters */}
        <div className="mt-5 rounded-xl border border-[#2b2420]/10 bg-[#f5f0e8]/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b5d52]">
            <Sparkles size={14} className="text-[#d4a574]" />
            <span>Discussion prompts (click to add):</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {CONVERSATION_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => applyStarter(starter)}
                className="rounded-full border border-[#2b2420]/15 bg-[#fcfaf7] px-2.5 py-1 text-[11px] text-[#2b2420] transition-colors hover:border-[#8b4513] hover:bg-[#8b4513] hover:text-[#f5f0e8]"
              >
                {starter}
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

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="discussion-content"
                className="block text-xs font-semibold uppercase tracking-wider text-[#2b2420]"
              >
                Your Thoughts or Question{" "}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-[#6b5d52]/80">
                {content.length}/2000
              </span>
            </div>
            <textarea
              id="discussion-content"
              rows={5}
              required
              maxLength={2000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What thoughts or emotions did this reading spark? Feel free to quote chapters, ask a question, or recommend next steps..."
              className="mt-1.5 w-full rounded-xl border border-[#2b2420]/20 bg-[#ffffff] p-3 text-sm text-[#2b2420] placeholder:text-[#6b5d52]/50 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20 resize-none leading-relaxed"
            />
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
              disabled={loading || !content.trim()}
              className="h-auto rounded-xl bg-[#2b2420] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] transition-all hover:bg-[#8b4513] hover:shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin mr-1.5" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send size={15} className="mr-1.5" />
                  Post Discussion
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
