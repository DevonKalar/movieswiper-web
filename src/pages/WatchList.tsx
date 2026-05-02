import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "@/queries/useWatchlist";
import { useMovieFilters } from "@hooks/useMovieFilters";
import WatchListGrid from "@components/watchlist/WatchListGrid";
import WatchListFilter from "@components/watchlist/WatchListFilter";
import WatchListPagination from "@components/watchlist/WatchListPagination";

const WatchList = () => {
  const { likedMovies, removeLikedMovie, isLoading } = useWatchlist();
  const {
    filters,
    filteredMovies,
    availableGenres,
    availableDecades,
    addFilter,
    removeFilter
  } = useMovieFilters(likedMovies);
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef<HTMLElement | null>(null);
  const SKELETON_ARRAY = Array(12).fill(null);
  const ITEMS_PER_PAGE = 24;

  // Reset to page 1 on filter/search change - fixes issue where current page is out of range after filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };
  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center overflow-hidden py-12 px-4">
        <section className="w-full max-w-7xl relative mx-auto px-4 md:px-8 xl:px-0 ">
          <div className="flex flex-col items-center h-full justify-center gap-4 mb-12">
            <h1 className="animate-pulse">Loading your watchlist...</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 my-2">
            {SKELETON_ARRAY.map(() => (
              <div className="flex justify-center items-center aspect-2/3 bg-surface-overlay rounded-2xl animate-pulse mb-4">
                <p role="status" aria-live="polite" >loading</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (!likedMovies || likedMovies.length === 0) {
    return (
        <main className="flex-1 flex items-center justify-center overflow-hidden py-12 px-4">
          <div className="flex flex-col items-center h-full justify-center gap-4">
            <h1 className="text-3xl">Your Watchlist Is Empty</h1>
            <p className="text-center">Explore great movies and swipe to add to your watchlist.</p>
            <Link to="/" className="px-6 h-12 flex flex-col align-center justify-center bg-primary text-white rounded-full hover:opacity-75">Discover Movies</Link>
          </div>
        </main>
    );
  }

  return (
      <main ref={topRef} className="flex-1 overflow-hidden py-12">
        <div className="w-full max-w-7xl relative mx-auto px-4 md:px-8 xl:px-0 ">
          <h1>Your Watchlist</h1>
          <WatchListFilter
            filters={filters}
            addFilter={addFilter}
            removeFilter={removeFilter}
            availableGenres={availableGenres}
            availableDecades={availableDecades}
          />
          <WatchListGrid
            movies={paginatedMovies}
            removeLikedMovie={removeLikedMovie}
          />
          <WatchListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            prevPage={prevPage}
            nextPage={nextPage}
            goToPage={goToPage}
          />
        </div>
      </main>
  );
};

export default WatchList;
