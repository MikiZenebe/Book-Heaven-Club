import { GOOGLE_CLIENT_ID } from "@/constants/baseUrl";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useRef, useState } from "react";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccounts {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme: string;
      size: string;
      shape: string;
      text: string;
      width: number;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccounts;
      };
    };
  }
}

export default function Header() {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [googleReady, setGoogleReady] = useState(false);

  // Authentication state comes from Zustand.
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const authError = useAuthStore((state) => state.error);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signOut = useAuthStore((state) => state.signOut);
  const clearError = useAuthStore((state) => state.clearError);
  console.log(user);
  useEffect(() => {
    let cancelled = false;
    let interval: number | undefined;

    function initializeGoogleSignIn() {
      const google = window.google;
      const buttonElement = googleButtonRef.current;

      if (cancelled || !google || !buttonElement || !GOOGLE_CLIENT_ID) {
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential: idToken }) => {
          clearError();

          // The store sends the token to the NestJS backend.
          await signInWithGoogle(idToken);
        },
      });

      buttonElement.replaceChildren();

      google.accounts.id.renderButton(buttonElement, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 220,
      });

      setGoogleReady(true);
    }

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      interval = window.setInterval(() => {
        if (window.google) {
          if (interval !== undefined) {
            window.clearInterval(interval);
          }

          initializeGoogleSignIn();
        }
      }, 100);
    }

    return () => {
      cancelled = true;

      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [clearError, signInWithGoogle]);

  async function handleSignOut() {
    clearError();
    await signOut();
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-19 w-full items-center justify-between gap-4 border-b border-stone-200/80 bg-[#fcfaf7]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left: Welcome message */}
      <div className="flex items-center gap-3 text-[11px] text-[#6b5d52]">
        <span className="hidden sm:inline">Good morning</span>
        <span className="hidden text-[#d4a574] sm:inline">·</span>
        <span className="italic">47 readers browsing right now</span>
      </div>

      {/* Right: Activity and authentication */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-3 py-2 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <span className="text-xs font-medium text-stone-500">
            Readers are exploring
          </span>
        </div>

        <div className="relative flex min-h-10 items-center justify-center">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex max-w-52 items-center gap-3 rounded-full border border-stone-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
                {user.user.picture ? (
                  <img
                    src={user.user.picture}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800">
                    {(user.user.name || user.user.email)
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-800">
                    {user.user.name || user.user.email}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {user.user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={authLoading}
                className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                {authLoading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="flex min-h-10 items-center justify-center">
              {authLoading ? (
                <div
                  className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-600"
                  role="status"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-amber-700" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  {!googleReady && GOOGLE_CLIENT_ID && (
                    <span className="mr-2 hidden text-xs text-stone-400 sm:inline">
                      Loading sign-in...
                    </span>
                  )}

                  {!GOOGLE_CLIENT_ID && (
                    <span className="text-xs text-red-600">
                      Sign-in is not configured.
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Keep this element mounted so the Google button survives sign-out. */}
          <div
            ref={googleButtonRef}
            className={
              user || authLoading || !GOOGLE_CLIENT_ID
                ? "hidden"
                : "max-w-full overflow-hidden"
            }
          />
        </div>
      </div>

      {authError && (
        <div
          role="alert"
          className="absolute right-4 top-[calc(100%+8px)] z-50 max-w-[calc(100vw-2rem)] rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg sm:right-6"
        >
          <div className="flex items-start gap-3">
            <span className="flex-1">{authError}</span>

            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss authentication error"
              className="font-semibold text-red-500 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
