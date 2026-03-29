import { MovieFeedContext, type MovieFeedContextType } from "./MovieFeedContext";
import useAuth from './AuthContext'
import { useState, useEffect } from "react";
import { useMinimumLoading } from "@hooks/useMinimumLoading";
import fetchRecommendations from "@services/recommendations";
import type { Movie } from "@/types/movie";
import type { ProviderProps } from '@/types/provider';

const MovieFeedProvider = ({ children }: ProviderProps) => {
  const [movieQueue, setMovieQueue] = useState<Movie[]>([]);
  const [feedPosition, setFeedPosition] = useState<number>(0);
  const [queryPage, setQueryPage] = useState<number>(1);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();
  const { isLoading, startLoading, stopLoading } = useMinimumLoading(300);

  async function loadMovies(): Promise<void> {
    startLoading();
    try {
      const fetchedMovies = await fetchRecommendations.fetchRecommendations(queryPage);

      if (fetchedMovies.results.length === 0) {
        throw new Error('No movies available at the moment. Please try again later.');
      }
      
      const remainingMovies = movieQueue.slice(feedPosition + 1);
      setMovieQueue([...remainingMovies, ...fetchedMovies.results]);
      setFeedPosition(0);

    } catch (error) {
      console.error('Error fetching movies:', error);
      const err = error instanceof Error 
        ? error 
        : new Error('Failed to load movies. Please try again later.');
      setError(err);
    } finally {
      stopLoading();
    } 
  }

  function moveToNext(): void {
    if (feedPosition < movieQueue.length - 1) {
      setFeedPosition(prevIndex => prevIndex + 1);
    } else {
      setQueryPage(prevPage => prevPage + 1);
    }
  };

  useEffect(() => {
    loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPage, isAuthenticated]);

  const value: MovieFeedContextType = {
    movieQueue,
    feedPosition,
    isLoading,
    error,
    moveToNext
  };

  return (
    <MovieFeedContext.Provider value={value}>
      {children}
    </MovieFeedContext.Provider>
  );
}

export default MovieFeedProvider;