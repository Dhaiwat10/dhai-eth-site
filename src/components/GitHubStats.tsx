import { useState, useEffect } from "react";
import { fetchGitHubStats } from "../services/github";
import type { GitHubStats as GitHubStatsType } from "../types/github";

interface GitHubStatsProps {
  username: string;
}

export function GitHubStats({ username }: GitHubStatsProps) {
  const [stats, setStats] = useState<GitHubStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchGitHubStats(username);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch GitHub stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [username]);

  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-800 p-6 bg-gray-900/50 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
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
          Unable to fetch GitHub statistics. Please try again later.
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No GitHub data available.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Stars Received",
      value: stats.totalStars.toLocaleString(),
      icon: "⭐",
      type: "stat" as const,
    },
    {
      label: "Followers",
      value: stats.followers.toLocaleString(),
      icon: "👥",
      type: "stat" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Latest Repos */}
      {stats.latestRepos.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Latest Repositories</h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.latestRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all bg-gray-900/50 block"
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-xl shrink-0 mt-0.5">📦</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-white hover:text-gray-300 transition-colors truncate">
                      {repo.name}
                    </p>
                  </div>
                </div>

                {repo.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    ⭐ {repo.stars}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-all bg-gray-900/50 w-[200px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.icon}</span>
              <h4 className="text-xs font-medium text-gray-400">{card.label}</h4>
            </div>
            <p className="text-xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}