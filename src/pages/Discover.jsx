import { useRef, useState, useCallback } from "react";
import DiscoverCard from "@components/discover/DiscoverCard";
import ScreenReaderAnnouncement from "@components/common/ScreenReaderAnnouncement";
import { useWatchlist } from "@/queries/useWatchlist";
import { useRecommendationsFeed } from "@/queries/useRecommendations";
import { useAnnouncement } from "@hooks/useAnnouncement.js";

const Discover = () => {
  const { likeMovie, rejectMovie } = useWatchlist();
  const { movieQueue, feedPosition, isLoading, moveToNext, moveToPrev } = useRecommendationsFeed();
  const { announcement, announce } = useAnnouncement();
  const cardRef = useRef(null);

  // Which direction the new card enters from when feedPosition changes
  const [enterFrom, setEnterFrom] = useState(null);

  const currentMovie = movieQueue[feedPosition];
  const hasPrev = feedPosition > 0;

  const focusCard = useCallback(() => {
    setTimeout(() => { if (cardRef.current) cardRef.current.focus(); }, 380);
  }, []);

  const goForward = useCallback(() => {
    setEnterFrom('bottom');
    moveToNext();
    focusCard();
  }, [moveToNext, focusCard]);

  const goBack = useCallback(() => {
    if (!hasPrev) return;
    setEnterFrom('top');
    moveToPrev();
    focusCard();
  }, [hasPrev, moveToPrev, focusCard]);

  const handleSwipe = useCallback((direction) => {
    if (!currentMovie) return;
    if (direction === 'right') {
      likeMovie(currentMovie);
      announce(`${currentMovie.title} added to watchlist`);
    } else {
      rejectMovie(currentMovie);
      announce(`Passed on ${currentMovie.title}`);
    }
    goForward();
  }, [currentMovie, likeMovie, rejectMovie, announce, goForward]);

  const handleNavigate = useCallback((direction) => {
    if (direction === 'up') goForward();
    else goBack();
  }, [goForward, goBack]);

  if (isLoading && movieQueue.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm aspect-2/3 rounded-2xl bg-surface-overlay animate-pulse flex items-center justify-center">
          <h4 className="type-display-xs animate-pulse">Getting Movies...</h4>
        </div>
      </main>
    );
  }

  return (
    <>
      <ScreenReaderAnnouncement message={announcement} />
      <main
        className="flex flex-col flex-1 items-center justify-center overflow-hidden py-4 px-4"
        aria-label="Movie discovery area"
      >
        <p className="text-text-muted text-xs mb-2 select-none" aria-hidden="true">
          ↕ swipe to browse &nbsp;·&nbsp; ← pass &nbsp;·&nbsp; → like
        </p>

        <div className="relative w-full max-w-sm aspect-2/3">
          {currentMovie ? (
            <DiscoverCard
              key={`${currentMovie.id}-${feedPosition}`}
              movie={currentMovie}
              onSwipe={handleSwipe}
              onNavigate={handleNavigate}
              enterFrom={enterFrom}
              isActive={true}
              cardRef={cardRef}
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-surface-overlay flex items-center justify-center">
              <p className="text-text-muted text-sm">No more movies right now.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {hasPrev && (
            <button
              onClick={goBack}
              className="not-italic font-normal text-xs bg-surface-raised text-text-muted h-8 py-1 px-3 rounded-full hover:bg-surface-overlay"
              aria-label="Previous movie"
            >
              ↑ Back
            </button>
          )}
          <button
            onClick={goForward}
            className="not-italic font-normal text-xs bg-surface-raised text-text-muted h-8 py-1 px-3 rounded-full hover:bg-surface-overlay"
            aria-label="Next movie"
          >
            ↓ Next
          </button>
        </div>
      </main>
    </>
  );
};

export default Discover;
