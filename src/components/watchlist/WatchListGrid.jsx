import { CloseIcon, InfoIcon } from '@icons';
import useModal from '@hooks/useModal';
import MovieModal from '../common/MovieModal';

const WatchListGrid = ({movies, removeLikedMovie }) => {
  const { modalId, openModal, closeModal } = useModal();

  if (!movies || movies.length === 0) {
    return <p role="status" aria-live="polite">No movies found matching your criteria.</p>;
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 my-2"
      role="list"
      aria-label="Watchlist movies"
    >
      {movies.map((movie) => (
        <article 
          className="group relative aspect-2/3 bg-surface-overlay rounded-2xl"
          key={movie.id || movie.title}
          role="listitem"
        >
          <img
            className="rounded-2xl w-full h-full object-cover"
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            onClick={() => openModal(movie.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(movie.id);
              }
            }}
          />
          <button 
            onClick={() => removeLikedMovie(movie)} 
            className="absolute md:hidden top-2 right-2 p-0 rounded-full bg-transparent text-error-500 h-fit w-fit" 
            aria-label={`Remove ${movie.title} from watchlist`}
          >
            <CloseIcon height={32} width={32} className="rounded-full" aria-hidden="true" />
          </button>
          <div 
            className="hidden group-hover:flex flex-col absolute top-0 left-0 w-full h-full p-4 justify-between opacity-0 hover:opacity-100 bg-blur text-white rounded-2xl border-1 border-border-muted"
            aria-hidden="true"
          >
            <div className="overlay flex flex-row justify-between items-start gap-4">
              <div>
                <h3>{movie.title}</h3>
                <p>{movie.genres.join(", ")}</p>
              </div>
              <button
                className="h-6 w-6 p-0 rounded-full bg-transparent text-error-500"
                onClick={() => removeLikedMovie(movie)}
                type="button"
                aria-label={`Remove ${movie.title} from watchlist`}
                tabIndex="-1"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => openModal(movie.id)}
                className="border-2 border-primary w-full"
                type="button"
                aria-label={`View details for ${movie.title}`}
                tabIndex="-1"
              >
                Explore
              </button>
            </div>
          </div>
        <MovieModal
          movie={movie}
          isOpen={modalId === movie.id}
          closeModal={closeModal}
        />
        </article>
      ))}
    </div>
  );
};

export default WatchListGrid;