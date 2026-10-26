import { create } from "zustand";
import { API_BASE_URL } from "@/constants/baseUrl";
import type {
  ShelfBook,
  AddShelfBookInput,
  UpdateShelfBookInput,
} from "@/types/shelf";

type ShelfStore = {
  books: ShelfBook[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  loadBookshelf: () => Promise<void>;
  addShelfBook: (book: AddShelfBookInput) => Promise<ShelfBook>;
  updateShelfBook: (id: string, updates: UpdateShelfBookInput) => Promise<void>;
  removeShelfBook: (id: string) => Promise<void>;
  clearShelf: () => void;
};

async function readError(
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

export const useShelfStore = create<ShelfStore>()((set) => ({
  books: [],
  loading: false,
  saving: false,
  error: null,

  loadBookshelf: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/bookshelf`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Sign in to peek at your bookshelf."
            : await readError(response, "Could not load your bookshelf."),
        );
      }

      const books: ShelfBook[] = await response.json();
      set({ books });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Could not load your bookshelf.",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addShelfBook: async (book) => {
    set({ saving: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/bookshelf`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        throw new Error(await readError(response, "Could not save this book."));
      }

      const savedBook: ShelfBook = await response.json();

      set((state) => ({
        books: [
          ...state.books.filter(
            (item) => item.openLibraryId !== savedBook.openLibraryId,
          ),
          savedBook,
        ],
      }));

      return savedBook;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Could not save this book.",
      });
      throw error;
    } finally {
      set({ saving: false });
    }
  },

  updateShelfBook: async (id, updates) => {
    set({ saving: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE_URL}/bookshelf/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Couldn't update that one."));
      }

      const data = await response.json();

      set((state) => ({
        books: state.books.map((book) =>
          book.id === id ? { ...book, ...updates, ...data } : book,
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Couldn't update that one.",
      });
      throw error;
    } finally {
      set({ saving: false });
    }
  },

  removeShelfBook: async (id) => {
    set({ saving: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE_URL}/bookshelf/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(await readError(response, "Couldn't remove that one."));
      }

      // Don't parse JSON: DELETE may return 204 No Content.
      set((state) => ({
        books: state.books.filter((book) => book.id !== id),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Couldn't remove that one.",
      });
      throw error;
    } finally {
      set({ saving: false });
    }
  },

  clearShelf: () =>
    set({
      books: [],
      loading: false,
      saving: false,
      error: null,
    }),
}));
