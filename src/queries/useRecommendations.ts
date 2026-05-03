import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRecommendations } from '@services/recommendations';
import { queryKeys } from './keys';
import useAuth from '@/providers/AuthContext';
import type { Movie } from '@/types/movie';

export function useRecommendationsFeed() {
  const { isAuthenticated } = useAuth();
  const [feedPosition, setFeedPosition] = useState(0);

  const { data, fetchNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: [...queryKeys.recommendations.all, { isAuthenticated }],
    queryFn: async ({ pageParam }) => {
      const data = await fetchRecommendations(pageParam as number);
      if (!data.results?.length) {
        throw new Error('No movies available at the moment. Please try again later.');
      }
      return data.results as Movie[];
    },
    initialPageParam: 1,
    getNextPageParam: (_lastPage, allPages) => allPages.length + 1,
    staleTime: 1000 * 60 * 5,
  });

  const movieQueue = data?.pages.flat() ?? [];

  useEffect(() => {
    setFeedPosition(0);
  }, [isAuthenticated]);

  function moveToNext(): void {
    const next = feedPosition + 1;
    if (next >= movieQueue.length) fetchNextPage();
    setFeedPosition(next);
  }

  function moveToPrev(): void {
    if (feedPosition > 0) setFeedPosition(feedPosition - 1);
  }

  return {
    movieQueue,
    feedPosition,
    isLoading,
    error: error as Error | null,
    moveToNext,
    moveToPrev,
  };
}
