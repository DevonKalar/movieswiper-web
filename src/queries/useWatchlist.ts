import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authWatchlist from '@services/authWatchlist';
import * as guestWatchlist from '@services/guestWatchlist';
import { queryKeys } from './keys';
import useAuth from '@/providers/AuthContext';
import type { Movie } from '@/types/movie';

const REJECTED_MOVIES_KEY = 'rejectedMovies';

interface WatchlistService {
  getWatchlist(): Promise<Movie[]>;
  addToWatchlist(movie: Movie | Movie[]): Promise<void>;
  removeFromWatchlist(movieId: number): Promise<void>;
}

function getWatchlistService(isAuthenticated: boolean): WatchlistService {
  return isAuthenticated ? authWatchlist : guestWatchlist;
}

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorage(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useAddToWatchlist() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const service = getWatchlistService(isAuthenticated);

  return useMutation({
    mutationFn: (movie: Movie | Movie[]) => service.addToWatchlist(movie),
    onMutate: async (movie) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.watchlist.list() });
      const previous = queryClient.getQueryData<Movie[]>(queryKeys.watchlist.list());
      const incoming = Array.isArray(movie) ? movie : [movie];
      queryClient.setQueryData<Movie[]>(queryKeys.watchlist.list(), (old = []) => [
        ...old,
        ...incoming.filter((m) => !old.some((o) => o.id === m.id)),
      ]);
      return { previous };
    },
    onError: (_err, _movie, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.watchlist.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.list() });
    },
  });
}

export function useRemoveFromWatchlist() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const service = getWatchlistService(isAuthenticated);

  return useMutation({
    mutationFn: (movieId: number) => service.removeFromWatchlist(movieId),
    onMutate: async (movieId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.watchlist.list() });
      const previous = queryClient.getQueryData<Movie[]>(queryKeys.watchlist.list());
      queryClient.setQueryData<Movie[]>(queryKeys.watchlist.list(), (old = []) =>
        old.filter((m) => m.id !== movieId)
      );
      return { previous };
    },
    onError: (_err, _movieId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.watchlist.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.list() });
    },
  });
}

export function useWatchlist() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const service = getWatchlistService(isAuthenticated);
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const { data: likedMovies = [], isLoading, error } = useQuery({
    queryKey: queryKeys.watchlist.list(),
    queryFn: () => service.getWatchlist(),
    staleTime: isAuthenticated ? 1000 * 60 * 5 : Infinity,
    retry: false,
  });

  const { data: rejectedMovies = [] } = useQuery({
    queryKey: queryKeys.watchlist.rejected(),
    queryFn: () => readLocalStorage<Movie[]>(REJECTED_MOVIES_KEY, []),
    staleTime: Infinity,
  });

  function likeMovie(movie: Movie): void {
    if (likedMovies.some((m) => m.id === movie.id)) return;

    const updatedRejected = rejectedMovies.filter((m) => m.id !== movie.id);
    writeLocalStorage(REJECTED_MOVIES_KEY, updatedRejected);
    queryClient.setQueryData(queryKeys.watchlist.rejected(), updatedRejected);

    addMutation.mutate(movie);
  }

  function rejectMovie(movie: Movie): void {
    if (rejectedMovies.some((m) => m.id === movie.id)) return;

    const updated = [...rejectedMovies, movie];
    writeLocalStorage(REJECTED_MOVIES_KEY, updated);
    queryClient.setQueryData(queryKeys.watchlist.rejected(), updated);

    if (!isAuthenticated) {
      removeMutation.mutate(movie.id);
    }
  }

  function removeLikedMovie(movie: Movie): void {
    removeMutation.mutate(movie.id);
  }

  return {
    likedMovies,
    rejectedMovies,
    isLoading,
    error: error as Error | null,
    likeMovie,
    rejectMovie,
    removeLikedMovie,
  };
}
