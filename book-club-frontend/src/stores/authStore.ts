import { create } from "zustand";

import { API_BASE_URL } from "@/constants/baseUrl";
import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "booknest_token";
const USER_KEY = "booknest_user";

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type AuthStore = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  loadCurrentUser: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.json();

    return typeof data.message === "string" ? data.message : fallback;
  } catch {
    return fallback;
  }
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  loading: false,
  error: null,

  // Restore the session after a page refresh.
  loadCurrentUser: async () => {
    const token = getStoredToken();
    set({ loading: true, error: null });

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (response.status === 401) {
        try {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } catch {
          /* empty */
        }
        set({ user: null, token: null });
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Could not restore your session."),
        );
      }

      const data = await response.json();
      const authUser: AuthUser =
        data.user && data.user.id ? { user: data.user } : data;

      try {
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      } catch {
        /* empty */
      }

      set({ user: authUser, error: null });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Could not restore your session.",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Send Google's credential to NestJS for verification.
  signInWithGoogle: async (idToken) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Google sign-in failed. Please try again.",
          ),
        );
      }

      const data = await response.json();
      const authUser: AuthUser =
        data.user && data.user.id ? { user: data.user } : data;
      const token: string | null = data.accessToken || null;

      if (token) {
        try {
          localStorage.setItem(TOKEN_KEY, token);
        } catch {
          /* empty */
        }
      }
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      } catch {
        /* empty */
      }

      set({ user: authUser, token, error: null });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Google sign-in failed.",
      });

      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // End the server-side session.
  signOut: async () => {
    set({ loading: true, error: null });
    const token = getStoredToken();

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers,
      });
    } catch {
      // Best effort logout on server
    } finally {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        /* empty */
      }
      set({ user: null, token: null, loading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
