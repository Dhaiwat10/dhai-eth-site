import type { LetterboxdMovie, LetterboxdFeed } from '../types/letterboxd';

export class LetterboxdService {
  private static readonly RSS_URL = (username: string) => `https://letterboxd.com/${username}/rss/`;
  private static readonly RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

  static async fetchUserFeed(username: string): Promise<LetterboxdFeed> {
    try {
      const apiUrl = `${this.RSS2JSON_API}?rss_url=${encodeURIComponent(this.RSS_URL(username))}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch Letterboxd feed: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error(`RSS2JSON error: ${data.message || 'Unknown error'}`);
      }
      
      const movies = this.parseRSS2JSON(data);
      
      return {
        movies,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Letterboxd feed:', error);
      throw error;
    }
  }

  private static parseRSS2JSON(data: any): LetterboxdMovie[] {
    const movies: LetterboxdMovie[] = [];

    data.items.forEach((item: any, index: number) => {
      try {
        const title = item.title || '';
        const description = item.description || item.content || '';
        
        // Parse title and year from format "Film Name, Year - ★★★★"
        const titleMatch = title.match(/^(.+?),\s*(\d{4})/);
        if (!titleMatch) return;
        
        const [, movieTitle, yearStr] = titleMatch;
        const year = parseInt(yearStr, 10);
        
        // Extract rating from stars - handle both full stars and half stars
        const fullStarsMatch = title.match(/★/g);
        const halfStarMatch = title.match(/½/g);
        const fullStars = fullStarsMatch ? fullStarsMatch.length : 0;
        const halfStars = halfStarMatch ? halfStarMatch.length : 0;
        const rating = fullStars + (halfStars * 0.5) || undefined;
        
        // Extract poster image from description
        const posterMatch = description.match(/<img[^>]+src="([^"]+)"[^>]*>/);
        const posterUrl = posterMatch ? posterMatch[1] : undefined;
        
        // Extract review text (remove HTML tags)
        const reviewText = description
          .replace(/<[^>]*>/g, '')
          .replace(/^\s*[\r\n]/gm, '')
          .trim();
        
        // Use pubDate as watched date since Letterboxd specific fields might not be available in JSON
        const watchedDate = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        // Check if rewatch
        const rewatch = description.toLowerCase().includes('rewatch');
        
        movies.push({
          id: `letterboxd-${index}`,
          title: movieTitle.trim(),
          year,
          rating,
          memberRating: rating,
          watchedDate,
          rewatch,
          posterUrl,
          review: reviewText || undefined,
          url: item.link || undefined
        });
      } catch (error) {
        console.error('Error parsing RSS item:', error);
      }
    });

    return movies.sort((a, b) => new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime());
  }

  static async getRecentMovies(username: string, limit: number = 10): Promise<LetterboxdMovie[]> {
    const feed = await this.fetchUserFeed(username);
    return feed.movies.slice(0, limit);
  }
}