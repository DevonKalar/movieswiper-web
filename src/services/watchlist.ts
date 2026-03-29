import type { Movie } from "@/types/movie";

class watchlistApi {
  private readonly timeout: number;
  private readonly baseUrl: string;

  constructor(backendUrl: string = import.meta.env.VITE_BACKEND_URL) {
    this.timeout = 10000; // 10 second timeout for watchlist API
    this.baseUrl = `${backendUrl}watchlist`;
  }

  async fetchWithTimeout(url: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Network error');
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - server did not respond in time');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // adds one or more movies to the user's watchlist
  async addToWatchlist(movie: Movie | Movie[]) {
    const url = `${this.baseUrl}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movies: Array.isArray(movie) ? movie : [movie] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Watchlist API Error: ${errorText}`);
    }
  }

  async getWatchlist() {
    const url = `${this.baseUrl}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Watchlist API Error: ${errorText}`);
    }
    return response.json();
  }

  async removeFromWatchlist(movieId: number) {
    const url = `${this.baseUrl}/${movieId}`;
    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Watchlist API Error: ${errorText}`);
    }
  }
}

const watchlistService = new watchlistApi();
export default watchlistService;