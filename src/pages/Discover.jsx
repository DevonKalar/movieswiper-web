import { useRef, useEffect, useCallback, useState } from "react";
import DiscoverCard from "@components/discover/DiscoverCard";
import ScreenReaderAnnouncement from "@components/common/ScreenReaderAnnouncement";
import { useWatchlist } from "@/queries/useWatchlist";
import { useRecommendationsFeed } from "@/queries/useRecommendations";
import { useAnnouncement } from "@hooks/useAnnouncement.js";

const SWIPE_THRESHOLD = 50;
const NAV_COOLDOWN_MS = 600;
const REACTION_ANIMATION_MS = 380;

const Discover = () => {
    const { likeMovie, rejectMovie, likedMovies, rejectedMovies } = useWatchlist();
    const { movieQueue, feedPosition, isLoading, moveToNext, moveToPrev, fetchNextPage } = useRecommendationsFeed();
    const { announcement, announce } = useAnnouncement();

    const scrollRef = useRef(null);
    const cardEls = useRef([]);
    const cooldown = useRef(false);
    const touchStartY = useRef(0);
    const sentinelRef = useRef(null);
    const reactingRef = useRef(false);

    const [reactionAnim, setReactionAnim] = useState(null); // { index, direction: 'like'|'reject' }

    // Scroll so the target card is vertically centered with equal peek above and below
    const scrollToCard = useCallback((index) => {
        const container = scrollRef.current;
        const card = cardEls.current[index];
        if (!container || !card) return;
        const peek = Math.max(0, Math.floor((container.clientHeight - card.offsetHeight) / 2));
        container.scrollTo({ top: Math.max(0, card.offsetTop - peek), behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToCard(feedPosition);
        // Clear reaction animation when the feed advances (also handles end-of-queue no-ops)
        setReactionAnim(null);
        reactingRef.current = false;
    }, [feedPosition, scrollToCard]);

    // Add paddingTop/Bottom equal to peek so card 0 can also be scrolled to its centered position
    const updateContainerPadding = useCallback(() => {
        const container = scrollRef.current;
        const firstWrapper = cardEls.current[0];
        if (!container || !firstWrapper) return;
        const peek = Math.max(0, Math.floor((container.clientHeight - firstWrapper.offsetHeight) / 2));
        container.style.paddingTop = `${peek}px`;
        container.style.paddingBottom = `${peek}px`;
    }, []);

    useEffect(() => {
        if (movieQueue.length === 0) return;
        updateContainerPadding();
        window.addEventListener('resize', updateContainerPadding);
        return () => window.removeEventListener('resize', updateContainerPadding);
    }, [movieQueue.length, updateContainerPadding]);

    const navigate = useCallback((dir) => {
        if (cooldown.current) return;
        cooldown.current = true;
        if (dir === 'next') moveToNext();
        else moveToPrev();
        setTimeout(() => { cooldown.current = false; }, NAV_COOLDOWN_MS);
    }, [moveToNext, moveToPrev]);

    // Wheel — intercept on the container so it doesn't affect other pages
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onWheel = (e) => {
            e.preventDefault();
            if (Math.abs(e.deltaY) > 5) navigate(e.deltaY > 0 ? 'next' : 'prev');
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [navigate]);

    // Touch swipe — preventDefault on touchmove blocks native scroll
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
        const onTouchEnd = (e) => {
            const delta = touchStartY.current - e.changedTouches[0].clientY;
            if (Math.abs(delta) >= SWIPE_THRESHOLD) navigate(delta > 0 ? 'next' : 'prev');
        };
        const onTouchMove = (e) => e.preventDefault();
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchend', onTouchEnd);
            el.removeEventListener('touchmove', onTouchMove);
        };
    }, [navigate]);

    // Keyboard
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); navigate('next'); }
            else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); navigate('prev'); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [navigate]);

    // Load more when sentinel approaches the viewport
    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = scrollRef.current;
        if (!sentinel || !container) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) fetchNextPage(); },
            { root: container, threshold: 0 }
        );
        obs.observe(sentinel);
        return () => obs.disconnect();
    }, [fetchNextPage, movieQueue.length]);

    const handleLike = useCallback((movie) => {
        if (reactingRef.current) return;
        reactingRef.current = true;
        likeMovie(movie);
        announce(`${movie.title} added to watchlist`);
        setReactionAnim({ index: feedPosition, direction: 'like' });
        setTimeout(() => {
            moveToNext();
            // Fallback clear if feedPosition doesn't change (end of queue)
            setReactionAnim(null);
            reactingRef.current = false;
        }, REACTION_ANIMATION_MS);
    }, [likeMovie, announce, feedPosition, moveToNext]);

    const handleReject = useCallback((movie) => {
        if (reactingRef.current) return;
        reactingRef.current = true;
        rejectMovie(movie);
        announce(`Passed on ${movie.title}`);
        setReactionAnim({ index: feedPosition, direction: 'reject' });
        setTimeout(() => {
            moveToNext();
            setReactionAnim(null);
            reactingRef.current = false;
        }, REACTION_ANIMATION_MS);
    }, [rejectMovie, announce, feedPosition, moveToNext]);

    if (isLoading && movieQueue.length === 0) {
        return (
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-sm aspect-[2/3] rounded-2xl bg-surface-overlay animate-pulse flex items-center justify-center">
                    <h4 className="type-display-xs animate-pulse">Getting Movies...</h4>
                </div>
            </main>
        );
    }

    return (
        <>
            <ScreenReaderAnnouncement message={announcement} />
            <main
                ref={scrollRef}
                aria-label="Movie discovery feed"
                className="flex-1 overflow-y-scroll overflow-x-hidden scroll-smooth scrollbar-none px-4"
            >
                {movieQueue.map((movie, index) => (
                    <div
                        key={movie.id}
                        ref={(el) => { cardEls.current[index] = el; }}
                        className="py-4"
                    >
                        <DiscoverCard
                            movie={movie}
                            onLike={() => handleLike(movie)}
                            onReject={() => handleReject(movie)}
                            isLiked={likedMovies.some((m) => m.id === movie.id)}
                            isRejected={rejectedMovies.some((m) => m.id === movie.id)}
                            reactionAnimation={reactionAnim?.index === index ? reactionAnim.direction : null}
                        />
                    </div>
                ))}
                <div ref={sentinelRef} className="h-1" />
            </main>
        </>
    );
};

export default Discover;
