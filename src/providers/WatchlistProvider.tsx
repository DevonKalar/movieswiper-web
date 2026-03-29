import { useState, useEffect } from "react";
import { WatchlistContext, type WatchlistContextType } from "./WatchlistContext";
import useAuth from './AuthContext'
import watchlistService from "@/services/watchlist";
import { useMinimumLoading } from "@hooks/useMinimumLoading";
import type { Movie } from "@/types/movie";
import type { ProviderProps } from '@/types/provider';

const WatchlistProvider = ({ children }: ProviderProps) => {
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
	const [rejectedMovies, setRejectedMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();
  const { isLoading, startLoading, stopLoading } = useMinimumLoading(300);

  async function loadWatchlist(): Promise<void> {
    startLoading();
    setError(null);
    try {
      // Sync guest watchlist with user watchlist
      const guestWatchlist = likedMovies;
      if (guestWatchlist.length > 0) {
        await watchlistService.addToWatchlist(guestWatchlist);
      }
      // fetch the complete watchlist from the backend 
      const rawData = await watchlistService.getWatchlist();
      const watchlist = rawData.watchlist.map((item: { movie: Movie }) => item.movie);
      setLikedMovies(watchlist);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      const err = error instanceof Error ? error : new Error('Failed to load watchlist');
      setError(err);
    } finally {
      stopLoading();
    }
  }

  useEffect(()=> {
    if(isAuthenticated){
      loadWatchlist();
    } else {
      setLikedMovies([]);
    }
  }, [isAuthenticated]);

	async function likeMovie(newMovie: Movie): Promise<void> {
		if(likedMovies.some(movie => movie.id === newMovie.id)) return;
		
		const previousLikedMovies = likedMovies;
		const previousRejectedMovies = rejectedMovies;
		
		setLikedMovies((prev) => [...prev, newMovie]);
		setRejectedMovies((prev) => prev.filter(movie => movie.id !== newMovie.id));

    if(!isAuthenticated) return;
		
		try {
			await watchlistService.addToWatchlist(newMovie);
		} catch (error) {
			console.error("Failed to add movie to watchlist:", error);
      const err = error instanceof Error ? error : new Error('Failed to add movie to watchlist');
			setLikedMovies(previousLikedMovies);
			setRejectedMovies(previousRejectedMovies);
			setError(err);
		}
	}

	async function rejectMovie(newMovie: Movie): Promise<void> {
		if(rejectedMovies.some(movie => movie.id === newMovie.id)) return;
		setRejectedMovies((prev) => [...prev, newMovie]);
		setLikedMovies((prev) => prev.filter(movie => movie.id !== newMovie.id));
	}

	const removeLikedMovie = (newMovie: Movie): void => {
    const previousLikedMovies = likedMovies;

    setLikedMovies((prev) => prev.filter(movie => movie.id !== newMovie.id));

    if(!isAuthenticated) return;

    try {
      watchlistService.removeFromWatchlist(newMovie.id);
    } catch (error) {
      console.error("Failed to remove movie from watchlist:", error);
      setLikedMovies(previousLikedMovies);
      const err = error instanceof Error ? error : new Error('Failed to remove movie from watchlist');
      setError(err);
    }
	}

  const value: WatchlistContextType = {
    likedMovies,
    rejectedMovies,
    isLoading,
    error,
    likeMovie,
    rejectMovie,
    removeLikedMovie,
  }
	return (
		<WatchlistContext.Provider value={value}>
				{children}
		</WatchlistContext.Provider>
	)

}

export default WatchlistProvider;