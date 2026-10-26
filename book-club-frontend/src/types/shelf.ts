export type ReadingStatus = "WANT_TO_READ" | "CURRENTLY_READING" | "FINISHED";

export interface ShelfBook {
  id: string;
  openLibraryId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  status: ReadingStatus;
  rating: number | null;
  notes: string | null;
}

export type AddShelfBookInput = Pick<
  ShelfBook,
  "openLibraryId" | "title" | "authors" | "coverUrl"
>;

export type UpdateShelfBookInput = Partial<
  Pick<ShelfBook, "status" | "rating" | "notes">
>;
