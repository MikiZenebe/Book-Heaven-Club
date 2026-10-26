import { API_BASE_URL } from "@/constants/baseUrl";
import { create } from "zustand";

export interface Book {
  id: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  firstPublishYear: number | null;
  openLibraryUrl: string;
}

interface BookStore {
  query: string;
  books: Book[];
  loading: boolean;
  error: string | null;
  searched: boolean;

  setQuery: (query: string) => void;
  searchBooks: (query?: string) => Promise<void>;
  clearSearch: () => void;
}

export const useBookStore = create<BookStore>()((set, get) => ({
  query: "",
  books: [],
  loading: false,
  error: null,
  searched: false,

  setQuery: (query) => set({ query }),

  searchBooks: async (searchQuery) => {
    const query = (searchQuery ?? get().query).trim();

    if (!query) {
      set({
        error: "Enter a book title or author to search.",
        books: [],
        searched: false,
      });
      return;
    }

    set({
      query,
      loading: true,
      error: null,
      searched: true,
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search books. Please try again.");
      }

      const data: Book[] = await response.json();

      set({ books: data });
    } catch (error) {
      set({
        books: [],
        error: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      set({ loading: false });
    }
  },

  clearSearch: () =>
    set({
      query: "",
      books: [],
      error: null,
      loading: false,
      searched: false,
    }),
}));
