import apiClient from './apiClient';
import type { Movie } from '@/types/movie';

const TIMEOUT = 10000;

export async function getWatchlist(): Promise<Movie[]> {
  const response = await apiClient.get('/watchlist', { timeout: TIMEOUT });
  return response.data.watchlist.map((item: { movie: Movie }) => item.movie);
}

export async function addToWatchlist(movie: Movie | Movie[]): Promise<void> {
  await apiClient.post(
    '/watchlist',
    { movies: Array.isArray(movie) ? movie : [movie] },
    { timeout: TIMEOUT }
  );
}

export async function removeFromWatchlist(movieId: number): Promise<void> {
  await apiClient.delete(`/watchlist/${movieId}`, { timeout: TIMEOUT });
}
