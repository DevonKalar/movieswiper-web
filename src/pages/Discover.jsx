import { useRef, useState, useCallback } from "react";
import DiscoverCard from "@components/discover/DiscoverCard";
import ScreenReaderAnnouncement from "@components/common/ScreenReaderAnnouncement";
import { useWatchlist } from "@/queries/useWatchlist";
import { useRecommendationsFeed } from "@/queries/useRecommendations";
import { useAnnouncement } from "@hooks/useAnnouncement.js";
import { DownArrowIcon, PassIcon, HeartIcon } from "@icons";

const ActionButtons = ({ hasPrev, currentMovie, goBack, goForward, handleSwipe, className = "" }) => (
    <div className={`flex flex-col gap-3 ${className}`}>
        <button
            onClick={goBack}
            disabled={!hasPrev}
            className="not-italic font-normal p-0 w-12 h-12 rounded-full bg-primary disabled:opacity-40"
            aria-label="Previous movie"
        >
            <DownArrowIcon className="rotate-180" />
        </button>
        <button
            onClick={goForward}
            className="not-italic font-normal p-0 w-12 h-12 rounded-full bg-primary"
            aria-label="Next movie"
        >
            <DownArrowIcon />
        </button>
        <button
            onClick={() => handleSwipe('left')}
            disabled={!currentMovie}
            className="not-italic font-normal p-0 w-12 h-12 rounded-full bg-error-500"
            aria-label={currentMovie ? `Pass on ${currentMovie.title}` : 'Pass'}
        >
            <PassIcon />
        </button>
        <button
            onClick={() => handleSwipe('right')}
            disabled={!currentMovie}
            className="not-italic font-normal p-0 w-12 h-12 rounded-full bg-success-500"
            aria-label={currentMovie ? `Like ${currentMovie.title}` : 'Like'}
        >
            <HeartIcon />
        </button>
    </div>
);

const Discover = () => {
    const { likeMovie, rejectMovie } = useWatchlist();
    const { movieQueue, feedPosition, isLoading, moveToNext, moveToPrev } = useRecommendationsFeed();
    const { announcement, announce } = useAnnouncement();
    const cardRef = useRef(null);
    const containerRef = useRef(null);
    const activeCardRef = useRef(null);
    const isSlidingRef = useRef(false);

    const [slideY, setSlideY] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

    const prevMovie = movieQueue[feedPosition - 1] ?? null;
    const currMovie = movieQueue[feedPosition] ?? null;
    const nextMovie = movieQueue[feedPosition + 1] ?? null;
    const hasPrev = feedPosition > 0;

    const focusCard = useCallback(() => {
        setTimeout(() => { if (cardRef.current) cardRef.current.focus(); }, 380);
    }, []);

    const getH = useCallback(
        () => containerRef.current?.offsetHeight ?? window.innerHeight,
        []
    );

    const goForward = useCallback(() => {
        if (isSlidingRef.current) return;
        isSlidingRef.current = true;
        setIsSliding(true);
        setSlideY(-getH());
        setTimeout(() => {
            isSlidingRef.current = false;
            setIsSliding(false);
            setSlideY(0);
            moveToNext();
            focusCard();
        }, 300);
    }, [getH, moveToNext, focusCard]);

    const goBack = useCallback(() => {
        if (!hasPrev || isSlidingRef.current) return;
        isSlidingRef.current = true;
        setIsSliding(true);
        setSlideY(getH());
        setTimeout(() => {
            isSlidingRef.current = false;
            setIsSliding(false);
            setSlideY(0);
            moveToPrev();
            focusCard();
        }, 300);
    }, [hasPrev, getH, moveToPrev, focusCard]);

    const handleSwipe = useCallback((direction) => {
        if (!currMovie) return;
        if (direction === 'right') {
            likeMovie(currMovie);
            announce(`${currMovie.title} added to watchlist`);
        } else {
            rejectMovie(currMovie);
            announce(`Passed on ${currMovie.title}`);
        }
        goForward();
    }, [currMovie, likeMovie, rejectMovie, announce, goForward]);

    const handleNavigate = useCallback((direction) => {
        if (direction === 'up') goForward();
        else goBack();
    }, [goForward, goBack]);

    const handleVerticalDrag = useCallback((deltaY) => {
        if (deltaY === null) {
            isSlidingRef.current = true;
            setIsSliding(true);
            setSlideY(0);
            setTimeout(() => {
                isSlidingRef.current = false;
                setIsSliding(false);
            }, 300);
        } else {
            if (isSlidingRef.current) return;
            setSlideY(deltaY);
        }
    }, []);

    // Used by action buttons: shows card overlay + exit animation, then advances deck
    const handleButtonSwipe = useCallback((direction) => {
        if (!currMovie) return;
        if (direction === 'right') {
            likeMovie(currMovie);
            announce(`${currMovie.title} added to watchlist`);
        } else {
            rejectMovie(currMovie);
            announce(`Passed on ${currMovie.title}`);
        }
        activeCardRef.current?.triggerSwipe(direction);
        goForward();
    }, [currMovie, likeMovie, rejectMovie, announce, goForward]);

    const buttonProps = { hasPrev, currentMovie: currMovie, goBack, goForward, handleSwipe: handleButtonSwipe };

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
                className="flex flex-col grow-1 justify-center min-h-0 md:py-4 md:px-4 overflow-hidden"
                aria-label="Movie discovery area"
            >
                <div className="flex justify-center">
                    <p className="text-center text-text-muted text-xs py-2 md:py-0 md:mb-2 select-none" aria-hidden="true">
                        ↕ swipe to browse &nbsp;·&nbsp; ← pass &nbsp;·&nbsp; → like
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    {/* Card container — overflow-hidden clips the pre-rendered off-screen cards */}
                    <div
                        ref={containerRef}
                        className="relative w-[500px] h-[750px] max-w-full max-h-full rounded-2xl overflow-hidden"
                    >
                        {/* Outer deck — all 3 slots translate together during navigation */}
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `translateY(${slideY}px)`,
                                transition: isSliding ? 'transform 300ms ease-out' : 'none',
                            }}
                        >
                            {/* Prev card — pre-rendered one slot above, hidden until sliding back */}
                            <div
                                key={prevMovie?.id ?? 'prev-empty'}
                                className="absolute inset-0 p-4"
                                style={{ transform: 'translateY(-100%)', transition: 'none' }}
                            >
                                {prevMovie && (
                                    <DiscoverCard
                                        movie={prevMovie}
                                        isActive={false}
                                        onSwipe={handleSwipe}
                                        onNavigate={handleNavigate}
                                    />
                                )}
                            </div>

                            {/* Current card */}
                            <div
                                key={currMovie?.id ?? 'curr-empty'}
                                className="absolute inset-0 p-4"
                                style={{ transition: 'none' }}
                            >
                                {currMovie ? (
                                    <DiscoverCard
                                        ref={activeCardRef}
                                        movie={currMovie}
                                        isActive={true}
                                        onSwipe={handleSwipe}
                                        onNavigate={handleNavigate}
                                        onVerticalDrag={handleVerticalDrag}
                                        cardRef={cardRef}
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-2xl bg-surface-overlay flex items-center justify-center">
                                        <p className="text-text-muted text-sm">No more movies right now.</p>
                                    </div>
                                )}
                            </div>

                            {/* Next card — pre-rendered one slot below, hidden until sliding forward */}
                            <div
                                key={nextMovie?.id ?? 'next-empty'}
                                className="absolute inset-0 p-4"
                                style={{ transform: 'translateY(100%)', transition: 'none' }}
                            >
                                {nextMovie && (
                                    <DiscoverCard
                                        movie={nextMovie}
                                        isActive={false}
                                        onSwipe={handleSwipe}
                                        onNavigate={handleNavigate}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Mobile floating buttons — overlaid on card */}
                        <ActionButtons {...buttonProps} className="absolute bottom-6 right-6 z-10 md:hidden" />
                    </div>

                    {/* Desktop buttons — beside card in the flex row */}
                    <ActionButtons {...buttonProps} className="hidden md:flex" />
                </div>
            </main>
        </>
    );
};

export default Discover;
