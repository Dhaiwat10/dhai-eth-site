export interface LetterboxdMovie {
  id: string;
  title: string;
  year: number;
  rating?: number;
  watchedDate: string;
  rewatch: boolean;
  posterUrl?: string;
  tmdbId?: string;
  review?: string;
  memberRating?: number;
}

export interface LetterboxdFeed {
  movies: LetterboxdMovie[];
  lastUpdated: string;
}