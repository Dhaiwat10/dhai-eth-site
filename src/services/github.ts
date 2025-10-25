import axios from "axios";
import type { GitHubStats, GitHubUser, GitHubRepo } from "../types/github";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  try {
    // Fetch user data for followers
    const userResponse = await axios.get<GitHubUser>(
      `${GITHUB_API_BASE}/users/${username}`
    );
    const followers = userResponse.data.followers;

    // Fetch all repositories
    const reposResponse = await axios.get<GitHubRepo[]>(
      `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`
    );

    // Calculate total stars from all repos (excluding forks)
    const totalStars = reposResponse.data
      .filter((repo) => !repo.fork)
      .reduce((sum, repo) => sum + repo.stargazers_count, 0);

    // Get latest 3 non-fork repositories
    const latestRepos = reposResponse.data
      .filter((repo) => !repo.fork)
      .sort(
        (a, b) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      )
      .slice(0, 3)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        updatedAt: repo.pushed_at,
        stars: repo.stargazers_count,
      }));

    // Fetch contributions for current year using GraphQL
    const contributionsThisYear = await fetchContributions(username);

    return {
      followers,
      contributionsThisYear,
      totalStars,
      latestRepos,
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    throw error;
  }
}

async function fetchContributions(username: string): Promise<number> {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01T00:00:00Z`;
    const endDate = `${currentYear}-12-31T23:59:59Z`;

    // GraphQL query to get contribution calendar
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
            }
          }
        }
      }
    `;

    const response = await axios.post(
      GITHUB_GRAPHQL_API,
      {
        query,
        variables: {
          username,
          from: startDate,
          to: endDate,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (
      response.data.data?.user?.contributionsCollection?.contributionCalendar
    ) {
      return response.data.data.user.contributionsCollection
        .contributionCalendar.totalContributions;
    }

    // Fallback: If GraphQL fails, return 0
    return 0;
  } catch (error) {
    console.error("Error fetching contributions:", error);
    // Return 0 if we can't fetch contributions
    return 0;
  }
}
