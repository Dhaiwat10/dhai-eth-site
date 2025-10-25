export interface GitHubStats {
  followers: number;
  contributionsThisYear: number;
  totalStars: number;
  latestRepos: LatestRepo[];
}

export interface GitHubUser {
  followers: number;
  public_repos: number;
}

export interface GitHubRepo {
  stargazers_count: number;
  fork: boolean;
  name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
  created_at: string;
  language: string | null;
  pushed_at: string;
}

export interface LatestRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  updatedAt: string;
  stars: number;
}