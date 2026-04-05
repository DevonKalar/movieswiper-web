import type { Movie } from '@/types/movie';

const GUEST_WATCHLIST_KEY = 'guestWatchlist';

function readWatchlist(): Movie[] {
  try {
    const stored = localStorage.getItem(GUEST_WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeWatchlist(movies: Movie[]): void {
  localStorage.setItem(GUEST_WATCHLIST_KEY, JSON.stringify(movies));
}

export async function getWatchlist(): Promise<Movie[]> {
  return readWatchlist();
}

export async function addToWatchlist(movie: Movie | Movie[]): Promise<void> {
  const current = readWatchlist();
  const incoming = Array.isArray(movie) ? movie : [movie];
  writeWatchlist([...current, ...incoming.filter((m) => !current.some((c) => c.id === m.id))]);
}

export async function removeFromWatchlist(movieId: number): Promise<void> {
  writeWatchlist(readWatchlist().filter((m) => m.id !== movieId));
}

export function clearWatchlist(): void {
  localStorage.removeItem(GUEST_WATCHLIST_KEY);
}
