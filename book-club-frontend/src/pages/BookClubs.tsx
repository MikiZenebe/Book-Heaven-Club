import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  X,
  Compass,
  Library,
  Sparkles,
  LoaderCircle,
  BookOpen,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import type { BookClub } from "@/types/book";
import ClubCard from "@/components/clubs/ClubCard";
import CreateClubModal from "@/components/clubs/CreateClubModal";

export default function BookClubs() {
  const [publicClubs, setPublicClubs] = useState<BookClub[]>([]);
  const [myClubs, setMyClubs] = useState<BookClub[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<"discover" | "my-clubs">(
    "discover",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "books" | "name">("popular");

  // Auth detection
  const [isSignedIn, setIsSignedIn] = useState(true);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join Action State
  const [joiningClubId, setJoiningClubId] = useState<string | null>(null);

  // Feedback Toast
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }

  // Refresh clubs after user actions
  async function refreshClubs() {
    try {
      const [pubRes, myRes] = await Promise.all([
        authFetch("/clubs/public"),
        authFetch("/clubs/mine"),
      ]);

      if (pubRes.ok) {
        const pubData: BookClub[] = await pubRes.json();
        setPublicClubs(pubData);
      }

      if (myRes.ok) {
        const myData: BookClub[] = await myRes.json();
        setIsSignedIn(true);
        setMyClubs(myData);
      } else if (myRes.status === 401) {
        setIsSignedIn(false);
        setMyClubs([]);
      }
    } catch {
      // Best-effort refresh
    }
  }

  // Initial load
  useEffect(() => {
    let ignore = false;

    async function loadInitialClubs() {
      try {
        const [pubRes, myRes] = await Promise.all([
          authFetch("/clubs/public"),
          authFetch("/clubs/mine"),
        ]);

        if (pubRes.ok) {
          const pubData: BookClub[] = await pubRes.json();
          if (!ignore) setPublicClubs(pubData);
        } else {
          if (!ignore) setPageError("Could not load public reading circles.");
        }

        if (myRes.ok) {
          const myData: BookClub[] = await myRes.json();
          if (!ignore) {
            setIsSignedIn(true);
            setMyClubs(myData);
          }
        } else if (myRes.status === 401) {
          if (!ignore) {
            setIsSignedIn(false);
            setMyClubs([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          setPageError(
            err instanceof Error ? err.message : "Failed to load clubs.",
          );
        }
      } finally {
        if (!ignore) setInitialLoading(false);
      }
    }

    loadInitialClubs();

    return () => {
      ignore = true;
    };
  }, []);

  // Create club handler
  async function handleCreateClub(data: {
    name: string;
    description: string;
    visibility: "PUBLIC" | "PRIVATE";
  }) {
    setCreateLoading(true);
    setCreateError(null);

    try {
      const response = await authFetch("/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in using the top bar to create a club.");
        }
        throw new Error(resData.message || "Could not create reading club.");
      }

      setIsCreateModalOpen(false);
      showToast(
        `Reading Circle "${data.name}" was founded successfully!`,
        "success",
      );

      // Refresh lists
      await refreshClubs();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create club.";
      setCreateError(msg);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  }

  // Join club handler
  async function handleJoinClub(clubId: string) {
    setJoiningClubId(clubId);

    try {
      const response = await authFetch(`/clubs/${clubId}/join`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          showToast(
            "Please sign in in the top navigation bar to join clubs.",
            "error",
          );
          return;
        }
        throw new Error(data.message || "Could not join reading club.");
      }

      showToast("Welcome! You joined the reading circle.", "success");
      await refreshClubs();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Something went wrong joining the club.",
        "error",
      );
    } finally {
      setJoiningClubId(null);
    }
  }

  // Filter and sort clubs
  const displayedClubs = useMemo(() => {
    const sourceList = activeTab === "discover" ? publicClubs : myClubs;
    let list = [...sourceList];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.owner?.name && c.owner.name.toLowerCase().includes(q)),
      );
    }

    // Sort order
    if (sortBy === "popular") {
      list.sort((a, b) => (b._count?.members ?? 0) - (a._count?.members ?? 0));
    } else if (sortBy === "books") {
      list.sort((a, b) => (b._count?.books ?? 0) - (a._count?.books ?? 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [activeTab, publicClubs, myClubs, searchQuery, sortBy]);

  // Total members across all public clubs for header stat
  const totalReadersCount = useMemo(() => {
    return publicClubs.reduce(
      (acc, curr) => acc + (curr._count?.members ?? 1),
      0,
    );
  }, [publicClubs]);

  const totalBooksCount = useMemo(() => {
    return publicClubs.reduce(
      (acc, curr) => acc + (curr._count?.books ?? 0),
      0,
    );
  }, [publicClubs]);

  return (
    <div className="min-h-screen py-10 sm:py-14 text-[#2b2420]">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "border-emerald-300 bg-[#fcfaf7] text-emerald-900 ring-1 ring-emerald-500/20"
              : "border-rose-300 bg-[#fcfaf7] text-rose-900 ring-1 ring-rose-500/20"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-stone-400 hover:text-stone-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-[#2b2420]/15 bg-[#ebe3d5]/50 p-7 sm:p-10 lg:p-12 shadow-sm">
        {/* Decorative corner seal */}
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#d4a574]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2b2420]/15 bg-[#fcfaf7] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[2px] text-[#8b4513]">
              <Sparkles size={12} className="text-[#d4a574]" />
              Literary Salons & Reading Circles
            </div>

            {/* Headline */}
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2b2420] leading-[1.1]">
              Read together, <br />
              <em className="text-[#8b4513] not-italic font-serif">
                think deeper.
              </em>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#6b5d52]">
              Gather with book lovers across the world. Share monthly shelves,
              compare annotations, and discuss stories that linger long after
              the final page.
            </p>

            {/* Live Stats Pill Row */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#2b2420]">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#2b2420]/10 bg-white/70 px-3.5 py-2">
                <Compass size={14} className="text-[#8b4513]" />
                <span className="font-semibold">{publicClubs.length}</span>
                <span className="text-[#6b5d52]">Public Circles</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-[#2b2420]/10 bg-white/70 px-3.5 py-2">
                <Users size={14} className="text-[#8b4513]" />
                <span className="font-semibold">{totalReadersCount}</span>
                <span className="text-[#6b5d52]">Readers</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-[#2b2420]/10 bg-white/70 px-3.5 py-2">
                <BookOpen size={14} className="text-[#8b4513]" />
                <span className="font-semibold">{totalBooksCount}</span>
                <span className="text-[#6b5d52]">Books Discussed</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#2b2420] px-6 py-4 font-serif text-base font-semibold text-[#f5f0e8] shadow-md transition-all duration-200 hover:bg-[#8b4513] hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5f0e8]/20 transition-transform group-hover:rotate-90">
                <Plus size={16} />
              </div>
              <span>Start a Reading Circle</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="space-y-8">
        {/* Navigation Tabs and Search/Sort Bar */}
        <div className="flex flex-col gap-4 border-b border-[#2b2420]/15 pb-4 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("discover")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "discover"
                  ? "bg-[#2b2420] text-[#f5f0e8] shadow-sm"
                  : "bg-transparent text-[#6b5d52] hover:bg-[#2b2420]/5 hover:text-[#2b2420]"
              }`}
            >
              <Compass size={14} />
              <span>Explore Circles</span>
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === "discover"
                    ? "bg-[#f5f0e8]/20 text-[#f5f0e8]"
                    : "bg-[#2b2420]/10 text-[#2b2420]"
                }`}
              >
                {publicClubs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("my-clubs")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "my-clubs"
                  ? "bg-[#2b2420] text-[#f5f0e8] shadow-sm"
                  : "bg-transparent text-[#6b5d52] hover:bg-[#2b2420]/5 hover:text-[#2b2420]"
              }`}
            >
              <Library size={14} />
              <span>My Clubs</span>
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === "my-clubs"
                    ? "bg-[#f5f0e8]/20 text-[#f5f0e8]"
                    : "bg-[#2b2420]/10 text-[#2b2420]"
                }`}
              >
                {myClubs.length}
              </span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:w-64 sm:flex-none">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b5d52]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circles by name, theme..."
                className="w-full rounded-xl border border-[#2b2420]/15 bg-[#fcfaf7] py-2 pl-8.5 pr-8 text-xs text-[#2b2420] placeholder:text-[#6b5d52]/60 focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b5d52] hover:text-[#2b2420]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border border-[#2b2420]/15 bg-[#fcfaf7] px-2.5 py-1.5 text-xs text-[#6b5d52]">
              <ArrowUpDown size={12} className="text-[#8b4513]" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "popular" | "books" | "name")
                }
                className="bg-transparent text-xs font-medium text-[#2b2420] focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Readers</option>
                <option value="books">Most Books</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Page Error */}
        {pageError && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-2xl border border-rose-300/80 bg-rose-50/90 p-4 text-xs text-rose-800"
          >
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => setPageError(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#6b5d52]">
            <LoaderCircle size={32} className="animate-spin text-[#8b4513]" />
            <p className="mt-3 font-serif text-base italic text-[#2b2420]">
              Gathering reading circles...
            </p>
          </div>
        ) : activeTab === "my-clubs" && !isSignedIn ? (
          /* Sign-in prompt for guest users visiting My Clubs */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#2b2420]/15 bg-[#fcfaf7] px-6 py-16 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8b4513]/10 text-[#8b4513]">
              <LogIn size={30} strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 font-serif text-2xl font-bold text-[#2b2420] sm:text-3xl">
              Sign In to View Your Clubs
            </h3>
            <p className="mt-2.5 max-w-md text-sm text-[#6b5d52] leading-relaxed">
              Use the Google sign-in button in the top navigation bar to create
              and join reading circles, track shared bookshelves, and take part
              in salon conversations.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("discover")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2b2420] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] hover:bg-[#8b4513] transition-colors"
            >
              <Compass size={14} />
              Explore Public Circles First
            </button>
          </div>
        ) : displayedClubs.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#2b2420]/15 bg-[#fcfaf7] px-6 py-16 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4a574]/20 text-[#8b4513]">
              {searchQuery ? (
                <Search size={30} strokeWidth={1.5} />
              ) : activeTab === "my-clubs" ? (
                <Library size={30} strokeWidth={1.5} />
              ) : (
                <Compass size={30} strokeWidth={1.5} />
              )}
            </div>

            <h3 className="mt-5 font-serif text-2xl font-bold text-[#2b2420]">
              {searchQuery
                ? `No circles found for "${searchQuery}"`
                : activeTab === "my-clubs"
                  ? "You haven't joined a reading circle yet"
                  : "No public reading circles founded yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-[#6b5d52] leading-relaxed">
              {searchQuery
                ? "Try searching for another genre, keyword, or author name."
                : activeTab === "my-clubs"
                  ? "Explore existing public clubs to read along with fellow book lovers, or create your own custom salon."
                  : "Be the pioneer reader who founds the first book club in this library."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl border border-[#2b2420]/20 bg-white px-4 py-2 text-xs font-semibold text-[#2b2420] hover:bg-[#2b2420]/5"
                >
                  Clear Search
                </button>
              ) : activeTab === "my-clubs" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab("discover")}
                    className="rounded-xl border border-[#2b2420]/20 bg-white px-4 py-2 text-xs font-semibold text-[#2b2420] hover:bg-[#2b2420]/5"
                  >
                    Explore Public Circles
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-xl bg-[#8b4513] px-4 py-2 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f]"
                  >
                    Found a Club
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-xl bg-[#8b4513] px-4 py-2 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f]"
                >
                  Found the First Club
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedClubs.map((club) => {
              const isMember = myClubs.some((item) => item.id === club.id);
              const isJoining = joiningClubId === club.id;

              return (
                <ClubCard
                  key={club.id}
                  club={club}
                  isMember={isMember}
                  onJoin={handleJoinClub}
                  isJoining={isJoining}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Create Club Modal */}
      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClub}
        loading={createLoading}
        errorMessage={createError}
      />
    </div>
  );
}
