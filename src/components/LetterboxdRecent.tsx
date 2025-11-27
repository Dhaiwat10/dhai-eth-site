import { useState, useEffect } from "react";
import type { LetterboxdMovie } from "../types/letterboxd";
import { LetterboxdService } from "../services/letterboxd";

interface LetterboxdRecentProps {
  username: string;
  limit?: number;
  showReviews?: boolean;
}

export function LetterboxdRecent({
  username,
  limit = 6,
  showReviews = false,
}: LetterboxdRecentProps) {
  const [movies, setMovies] = useState<LetterboxdMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const recentMovies = await LetterboxdService.getRecentMovies(
          username,
          limit,
        );
        setMovies(recentMovies);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [username, limit]);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 aspect-2/3 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error: {error}</p>
        <p className="text-sm text-gray-400 mt-2">
          Make sure the Letterboxd username is correct and the profile is
          public.
        </p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No recent movies found.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <a
            key={movie.id}
            href={movie.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group cursor-pointer block"
          >
            <div className="relative aspect-2/3 overflow-hidden rounded-lg mb-2 bg-gray-200 dark:bg-gray-800">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <div className="text-center p-4">
                    <div className="text-2xl mb-1">🎬</div>
                    <div className="text-xs">No Poster</div>
                  </div>
                </div>
              )}
              {movie.rewatch && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Rewatch
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-white line-clamp-2">
                {movie.title}
              </h3>
              <p className="text-xs text-gray-400">{movie.year}</p>
              {movie.memberRating && (
                <p className="text-xs text-yellow-400">
                  {renderStars(movie.memberRating)}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>

      {showReviews && movies.filter((m) => m.review).length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-semibold text-white">Recent Reviews</h3>
          {movies
            .filter((m) => m.review)
            .map((movie) => (
              <div
                key={`${movie.id}-review`}
                className="border-l-4 border-gray-600 pl-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-white">
                    {movie.title} ({movie.year})
                  </h4>
                  {movie.memberRating && (
                    <span className="text-yellow-400 text-sm">
                      {renderStars(movie.memberRating)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {movie.review}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(movie.watchedDate).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
