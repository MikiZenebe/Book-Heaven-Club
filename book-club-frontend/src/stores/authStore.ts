import { create } from "zustand";

import { API_BASE_URL } from "@/constants/baseUrl";
import type { AuthUser } from "@/types/auth";

type AuthStore = {
  user: AuthUser | null;
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
  user: null,
  loading: false,
  error: null,

  // Restore the session after a page refresh.
  loadCurrentUser: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        set({ user: null });
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Could not restore your session."),
        );
      }

      const user: AuthUser = await response.json();
      set({ user, error: null });
    } catch (error) {
      set({
        user: null,
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

      const user: AuthUser = await response.json();

      set({ user, error: null });
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

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Could not sign out. Please try again.",
          ),
        );
      }

      set({ user: null, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Could not sign out.",
      });

      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
