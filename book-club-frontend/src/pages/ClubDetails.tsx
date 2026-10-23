import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  LoaderCircle,
} from "lucide-react";
import { API_BASE_URL } from "@/constants/baseUrl";
import type { BookClub, ClubBookItem, ClubDiscussion } from "@/types/book";

// Subcomponents
import ClubHeader from "@/components/clubs/ClubHeader";
import ClubOverviewTab from "@/components/clubs/ClubOverviewTab";
import ClubBooksTab from "@/components/clubs/ClubBooksTab";
import ClubDiscussionsTab from "@/components/clubs/ClubDiscussionsTab";
import AddBookModal from "@/components/clubs/AddBookModal";
import NewDiscussionModal from "@/components/clubs/NewDiscussionModal";

type Tab = "overview" | "books" | "discussions";

export default function ClubDetails() {
  const { id } = useParams<{ id: string }>();

  const [club, setClub] = useState<BookClub | null>(null);
  const [books, setBooks] = useState<ClubBookItem[]>([]);
  const [discussions, setDiscussions] = useState<ClubDiscussion[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modals state
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [addBookLoading, setAddBookLoading] = useState(false);
  const [addBookError, setAddBookError] = useState<string | null>(null);

  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);
  const [newDiscussionLoading, setNewDiscussionLoading] = useState(false);
  const [newDiscussionError, setNewDiscussionError] = useState<string | null>(null);

  // Join action state
  const [isJoining, setIsJoining] = useState(false);

  // Toast feedback
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

  // Refresh data after user actions
  async function refreshClubData() {
    if (!id) return;
    try {
      const [pubRes, myRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clubs/public`),
        fetch(`${API_BASE_URL}/clubs/mine`, { credentials: "include" }),
      ]);

      const publicClubs: BookClub[] = pubRes.ok ? await pubRes.json() : [];
      const myClubs: BookClub[] = myRes.ok ? await myRes.json() : [];

      const foundInMine = myClubs.find((item) => item.id === id);
      const foundInPublic = publicClubs.find((item) => item.id === id);
      const foundClub = foundInMine || foundInPublic;

      if (foundClub) {
        setClub(foundClub);
        const userIsMember = Boolean(foundInMine);
        setIsMember(userIsMember);

        if (userIsMember) {
          const [booksRes, discussionsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/clubs/${id}/books`, {
              credentials: "include",
            }),
            fetch(`${API_BASE_URL}/clubs/${id}/discussions`, {
              credentials: "include",
            }),
          ]);

          if (booksRes.ok) {
            const booksData: ClubBookItem[] = await booksRes.json();
            setBooks(booksData);
          }

          if (discussionsRes.ok) {
            const discussionsData: ClubDiscussion[] = await discussionsRes.json();
            setDiscussions(discussionsData);
          }
        }
      }
    } catch {
      // Best-effort refresh
    }
  }

  // Initial load
  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      if (!id) {
        if (!ignore) {
          setPageError("No book club was specified.");
          setLoading(false);
        }
        return;
      }

      try {
        const [pubRes, myRes] = await Promise.all([
          fetch(`${API_BASE_URL}/clubs/public`),
          fetch(`${API_BASE_URL}/clubs/mine`, { credentials: "include" }),
        ]);

        const publicClubs: BookClub[] = pubRes.ok ? await pubRes.json() : [];
        const myClubs: BookClub[] = myRes.ok ? await myRes.json() : [];

        const foundInMine = myClubs.find((item) => item.id === id);
        const foundInPublic = publicClubs.find((item) => item.id === id);
        const foundClub = foundInMine || foundInPublic;

        if (!foundClub) {
          if (!ignore) {
            setPageError("This reading circle could not be found or is private.");
          }
          return;
        }

        if (!ignore) {
          setClub(foundClub);
          const userIsMember = Boolean(foundInMine);
          setIsMember(userIsMember);

          if (userIsMember) {
            const [booksRes, discussionsRes] = await Promise.all([
              fetch(`${API_BASE_URL}/clubs/${id}/books`, {
                credentials: "include",
              }),
              fetch(`${API_BASE_URL}/clubs/${id}/discussions`, {
                credentials: "include",
              }),
            ]);

            if (booksRes.ok) {
              const booksData: ClubBookItem[] = await booksRes.json();
              if (!ignore) setBooks(booksData);
            }

            if (discussionsRes.ok) {
              const discussionsData: ClubDiscussion[] = await discussionsRes.json();
              if (!ignore) setDiscussions(discussionsData);
            }
          } else {
            setBooks([]);
            setDiscussions([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          setPageError(
            err instanceof Error ? err.message : "Failed to load reading circle.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Handle adding a book via modal
  async function handleAddBook(data: {
    openLibraryId: string;
    title: string;
    authors: string[];
    coverUrl: string | null;
  }) {
    if (!id) return;

    setAddBookLoading(true);
    setAddBookError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/clubs/${id}/books`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(resData?.message || "Could not add book to shelf.");
      }

      showToast(`Added "${data.title}" to the club reading shelf!`, "success");
      setIsAddBookOpen(false);
      await refreshClubData();
      setActiveTab("books");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add book.";
      setAddBookError(msg);
      throw err;
    } finally {
      setAddBookLoading(false);
    }
  }

  // Handle posting discussion via modal
  async function handlePostDiscussion(content: string) {
    if (!id) return;

    setNewDiscussionLoading(true);
    setNewDiscussionError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/clubs/${id}/discussions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(resData?.message || "Could not post discussion.");
      }

      showToast("Your discussion was posted to the salon!", "success");
      setIsNewDiscussionOpen(false);
      await refreshClubData();
      setActiveTab("discussions");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post discussion.";
      setNewDiscussionError(msg);
      throw err;
    } finally {
      setNewDiscussionLoading(false);
    }
  }

  // Handle joining club
  async function handleJoinClub() {
    if (!id) return;
    setIsJoining(true);

    try {
      const response = await fetch(`${API_BASE_URL}/clubs/${id}/join`, {
        method: "POST",
        credentials: "include",
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          showToast("Please sign in using the top navigation bar to join.", "error");
          return;
        }
        throw new Error(resData?.message || "Could not join reading club.");
      }

      showToast(`Welcome! You joined ${club?.name || "the reading circle"}.`, "success");
      await refreshClubData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong joining the club.",
        "error",
      );
    } finally {
      setIsJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-[#6b5d52]">
        <LoaderCircle size={32} className="animate-spin text-[#8b4513]" />
        <p className="mt-4 font-serif text-lg italic text-[#2b2420]">
          Opening reading salon...
        </p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6">
        <Link
          to="/book-clubs"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d52] hover:text-[#8b4513] transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Book Clubs
        </Link>
        <div className="mt-8 rounded-3xl border border-[#2b2420]/15 bg-[#fcfaf7] p-8 text-center shadow-xs">
          <BookOpen size={36} className="mx-auto text-[#d4a574]" />
          <h2 className="mt-4 font-serif text-2xl font-bold text-[#2b2420]">
            Reading Circle Not Found
          </h2>
          <p className="mt-2 text-sm text-[#6b5d52]">
            {pageError || "The club you are looking for might be private or does not exist."}
          </p>
          <Link
            to="/book-clubs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2b2420] px-5 py-2.5 text-xs font-semibold text-[#f5f0e8] hover:bg-[#8b4513] transition-colors"
          >
            Explore Public Clubs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 text-[#2b2420]">
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

      {/* Back Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/book-clubs"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d52] hover:text-[#8b4513] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Book Clubs</span>
        </Link>
      </div>

      {/* Page Error Banner */}
      {pageError && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-2xl border border-rose-300/80 bg-rose-50/90 p-4 text-xs text-rose-800"
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

      {/* Reusable Hero Component */}
      <ClubHeader
        club={club}
        isMember={isMember}
        booksCount={books.length}
        discussionsCount={discussions.length}
        onOpenAddBook={() => setIsAddBookOpen(true)}
        onOpenNewDiscussion={() => setIsNewDiscussionOpen(true)}
        onJoinClub={handleJoinClub}
        isJoining={isJoining}
      />

      {/* Non-member Invitation Notice */}
      {!isMember && club.visibility === "PUBLIC" && (
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#8b4513]/20 bg-[#fcfaf7] p-5 sm:flex-row sm:p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8b4513]/10 text-[#8b4513]">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#2b2420]">
                Explore this circle as a member
              </h4>
              <p className="text-xs text-[#6b5d52]">
                Join this public club to add books to the shared reading shelf and join the conversation.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isJoining}
            onClick={handleJoinClub}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8b4513] px-4 py-2 text-xs font-semibold text-[#f5f0e8] hover:bg-[#72370f] transition-colors shrink-0"
          >
            <UserPlus size={14} />
            <span>Join Now</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-8 flex items-center gap-2 border-b border-[#2b2420]/15 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === "overview"
              ? "bg-[#2b2420] text-[#f5f0e8] shadow-sm"
              : "bg-transparent text-[#6b5d52] hover:bg-[#2b2420]/5 hover:text-[#2b2420]"
          }`}
        >
          <Sparkles size={14} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("books")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === "books"
              ? "bg-[#2b2420] text-[#f5f0e8] shadow-sm"
              : "bg-transparent text-[#6b5d52] hover:bg-[#2b2420]/5 hover:text-[#2b2420]"
          }`}
        >
          <BookOpen size={14} />
          <span>Reading List</span>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === "books"
                ? "bg-[#f5f0e8]/20 text-[#f5f0e8]"
                : "bg-[#2b2420]/10 text-[#2b2420]"
            }`}
          >
            {books.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("discussions")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
            activeTab === "discussions"
              ? "bg-[#2b2420] text-[#f5f0e8] shadow-sm"
              : "bg-transparent text-[#6b5d52] hover:bg-[#2b2420]/5 hover:text-[#2b2420]"
          }`}
        >
          <MessageSquare size={14} />
          <span>Discussions</span>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
              activeTab === "discussions"
                ? "bg-[#f5f0e8]/20 text-[#f5f0e8]"
                : "bg-[#2b2420]/10 text-[#2b2420]"
            }`}
          >
            {discussions.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview Component */}
      {activeTab === "overview" && (
        <ClubOverviewTab
          club={club}
          books={books}
          discussions={discussions}
          isMember={isMember}
          onOpenAddBook={() => setIsAddBookOpen(true)}
          onOpenNewDiscussion={() => setIsNewDiscussionOpen(true)}
          onSwitchTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Tab 2: Reading List Component */}
      {activeTab === "books" && (
        <ClubBooksTab
          books={books}
          isMember={isMember}
          onOpenAddBook={() => setIsAddBookOpen(true)}
          onJoinClub={handleJoinClub}
          isJoining={isJoining}
        />
      )}

      {/* Tab 3: Discussions Component */}
      {activeTab === "discussions" && (
        <ClubDiscussionsTab
          discussions={discussions}
          isMember={isMember}
          onOpenNewDiscussion={() => setIsNewDiscussionOpen(true)}
          onJoinClub={handleJoinClub}
          isJoining={isJoining}
        />
      )}

      {/* Add Book Modal Component */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSubmit={handleAddBook}
        loading={addBookLoading}
        errorMessage={addBookError}
      />

      {/* New Discussion Modal Component */}
      <NewDiscussionModal
        isOpen={isNewDiscussionOpen}
        onClose={() => setIsNewDiscussionOpen(false)}
        onSubmit={handlePostDiscussion}
        loading={newDiscussionLoading}
        errorMessage={newDiscussionError}
        clubName={club.name}
      />
    </div>
  );
}
