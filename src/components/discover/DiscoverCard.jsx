import { forwardRef, useImperativeHandle } from 'react';
import { LikeIcon, PassIcon, RejectIcon, HeartIcon, InfoIcon } from '@icons';
import MovieModal from "../common/MovieModal";
import { useModal } from "@hooks/useModal";
import { useCardGestures } from "@hooks/useCardGestures";

const DiscoverCard = forwardRef(({ movie, onSwipe, onNavigate, onVerticalDrag, isActive = true, cardRef = null }, ref) => {
  const { modalId, openModal, closeModal } = useModal();

  const {
    transform,
    isDragging,
    swipeDirection,
    gestureHandlers,
    triggerSwipe,
  } = useCardGestures(onSwipe, onNavigate, { onVerticalDrag });

  useImperativeHandle(ref, () => ({ triggerSwipe }), [triggerSwipe]);

  return (
    <>
      <article
        ref={cardRef}
        tabIndex={isActive ? 0 : -1}
        style={{ transform }}
        {...(isActive ? gestureHandlers : {})}
        className={`relative w-full h-full rounded-2xl overflow-hidden select-none touch-none z-10
          ${isDragging ? 'cursor-grabbing duration-0' : 'cursor-grab'}`}
        aria-hidden={!isActive}
      >
        {swipeDirection && (
          <div
            className={`absolute inset-0 rounded-2xl border-2 z-20 flex items-center justify-center
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
});

DiscoverCard.displayName = 'DiscoverCard';

export default DiscoverCard;
