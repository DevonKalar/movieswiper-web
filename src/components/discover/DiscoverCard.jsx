import { LikeIcon, PassIcon, RejectIcon, HeartIcon, InfoIcon } from '@icons';
import MovieModal from "../common/MovieModal";
import { useModal } from "@hooks/useModal";
import { useCardGestures } from "@hooks/useCardGestures";

const DiscoverCard = ({ movie, onSwipe, onNavigate, enterFrom = null, isActive = true, cardRef = null }) => {
  const { modalId, openModal, closeModal } = useModal();

  const {
    transform,
    isDragging,
    swipeDirection,
    isProcessingSwipe,
    gestureHandlers,
    triggerSwipe,
  } = useCardGestures(onSwipe, onNavigate);

  const handleActionButton = (e) => {
    e.preventDefault();
    triggerSwipe(e.currentTarget.value);
  };

  const entranceClass = enterFrom === 'bottom'
    ? 'slide-in-from-bottom'
    : enterFrom === 'top'
      ? 'slide-in-from-top'
      : '';

  return (
    <>
      <article
        ref={cardRef}
        tabIndex={isActive ? 0 : -1}
        style={{ transform }}
        {...(isActive ? gestureHandlers : {})}
        className={`relative rounded-2xl overflow-hidden select-none touch-none w-full h-full
          ${isDragging ? 'cursor-grabbing duration-0' : 'cursor-grab'}
          ${entranceClass}`}
        aria-hidden={!isActive}
      >
        {swipeDirection && (
          <div
            className={`absolute inset-0 rounded-2xl border-2 z-10 flex items-center justify-center
              ${swipeDirection === 'right'
                ? 'border-green-500 bg-green-500/25'
                : 'border-red-500 bg-red-500/25'}`}
            aria-hidden="true"
          >
            {swipeDirection === 'right'
              ? <HeartIcon className="h-16 w-16 rounded-full text-success-900 p-2 bg-success-500/25" aria-hidden="true" />
              : <RejectIcon className="h-16 w-16 text-error-900 p-2 bg-error-500/25 rounded-full" aria-hidden="true" />}
          </div>
        )}

        <img
          className="w-full h-full object-cover"
          src={movie.posterUrl}
          alt={`${movie.title} movie poster`}
          draggable={false}
        />

        <div
          className="group absolute inset-0 flex flex-col justify-end items-center py-4 opacity-0 hover:opacity-100 focus-within:opacity-100"
          role="group"
          aria-label="Movie actions"
        >
          <div className="flex gap-4">
            <button
              onClick={handleActionButton}
              disabled={isProcessingSwipe}
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 rounded-full w-16 h-16 bg-error-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:opacity-100"
              value="left"
              aria-label={`Pass on ${movie.title}`}
            >
              <PassIcon aria-hidden="true" />
            </button>
            <button
              onClick={handleActionButton}
              disabled={isProcessingSwipe}
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 rounded-full w-16 h-16 bg-success-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:opacity-100"
              value="right"
              aria-label={`Add ${movie.title} to watchlist`}
            >
              <LikeIcon aria-hidden="true" />
            </button>
          </div>
        </div>

        <button
          onClick={() => openModal(movie.id)}
          className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full text-white bg-transparent z-50"
          aria-label={`View details for ${movie.title}`}
        >
          <InfoIcon className="w-8 h-8 bg-primary rounded-full" aria-hidden="true" />
        </button>
      </article>

      <MovieModal movie={movie} isOpen={modalId === movie.id} closeModal={closeModal} />
    </>
  );
};

export default DiscoverCard;
