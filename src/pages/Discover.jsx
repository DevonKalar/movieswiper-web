import { useRef } from "react";
import DiscoverCard from "@components/discover/DiscoverCard";
import ScreenReaderAnnouncement from "@components/common/ScreenReaderAnnouncement";
import { useWatchlist } from "@/queries/useWatchlist";
import { useRecommendationsFeed } from "@/queries/useRecommendations";
import { useAnnouncement } from "@hooks/useAnnouncement.js";

const Discover = () => {
	const { likeMovie, rejectMovie} = useWatchlist();
  const { movieQueue, feedPosition, isLoading, moveToNext } = useRecommendationsFeed();
  const { announcement, announce } = useAnnouncement();
  const topCardRef = useRef(null);

  const currentMovie = movieQueue[feedPosition];
  const visibileMovies = movieQueue.slice(feedPosition, feedPosition + 2);

	// handle swipe
	const handleSwipe = (direction) => {
		if (direction === 'right') {
			likeMovie(currentMovie);
      announce(`${currentMovie.title} added to watchlist`);
		} else if (direction === 'left') {
			rejectMovie(currentMovie);
      announce(`Passed on ${currentMovie.title}`);
		}

    moveToNext();
    console.log('Moved to next movie in feed', feedPosition);
    // Focus on the next top card after swipe animation
    setTimeout(() => {
      if (topCardRef.current) {
        topCardRef.current.focus();
      }
    }, 350); // Slightly longer than the 300ms swipe animation 
	};

  return (
    <>
      <ScreenReaderAnnouncement message={announcement} />
      <main 
        className="flex flex-column flex-1 overflow-x-hidden overflow-y-auto py-16 px-4"
        aria-label="Movie discovery area"
      >
        <div className="card-wrapper relative w-full max-w-md mx-auto aspect-2/3">
          {visibileMovies.map((movie, index) => (
            <DiscoverCard 
              key={movie.id} 
              movie={movie} 
              onSwipe={handleSwipe} 
              isLoading={isLoading} 
              style={{ zIndex: 2 - index }}
              isTopCard={index === 0}
              cardRef={index === 0 ? topCardRef : null}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default Discover;
