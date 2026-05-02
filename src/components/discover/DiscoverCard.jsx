import { LikeIcon, PassIcon, RejectIcon, HeartIcon, InfoIcon } from '@icons';
import MovieModal from "../common/MovieModal";
import { useModal } from "@hooks/useModal";
import { useSwipe } from "@hooks/useSwipe";
import { useState, useEffect } from "react";

const DiscoverCard = ({ movie, onSwipe, isLoading, style, isTopCard = true, cardRef = null }) => {
  const { modalId, openModal, closeModal } = useModal();
  const [isVisible, setIsVisible] = useState(false);
  
  const {
    currentX,
    isDragging,
    swipeDirection,
    isProcessingSwipe,
    useSwipeHandlers,
    triggerSwipe,
  } = useSwipe(onSwipe);

  const handleSubmit = (e) => {
    e.preventDefault();
    const buttonValue = e.currentTarget.value;
    triggerSwipe(buttonValue);
  };

  // Set isVisible to true on mount for fade-in effect
  useEffect (() => {
    setIsVisible(true);
  }, []);

	if (isLoading) {
    return (
        <div className="absolute flex justify-center items-center w-full max-w-[500px] aspect-2/3 rounded-2xl border-2 bg-surface-overlay animate-pulse">
            <h4 className="text-3xl text-bold animate-pulse">Getting Movies...</h4>
        </div>
    );
  };

  return (
    <>
      <article 
        ref={cardRef}
        tabIndex={isTopCard ? 0 : -1}
        style={{ 
          transform: `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`,
          ...style 
        }} 
        {...(isTopCard ? useSwipeHandlers : {})}
        className={`absolute inset-0 rounded-2xl duration-0 aspect-2/3 overflow-hidden select-none touch-none fade-in
          ${isDragging ? 'cursor-grabbing ' : 'cursor-grab'}
          ${isVisible ? 'block' : 'hidden'}`}
        aria-hidden={!isTopCard}
        
      >
        {swipeDirection && (
          <div 
            className={`absolute rounded-2xl w-full h-full border-2 z-10 flex items-center justify-center transition-opacity duration-300
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
        <div>
          <img className={`bg-surface-overlay object-cover aspect-2/3`} src={movie.posterUrl} alt={`${movie.title} movie poster`} />
          <div className={`flex flex-row group absolute bottom-0 left-0 right-0 justify-center items-end gap-4 h-full py-4 opacity-0 hover:opacity-100 focus-within:opacity-100 text-white rounded-2xl `} 
            role="group"
            aria-label="Movie actions"
          >
            <button onClick={handleSubmit} 
              disabled={isProcessingSwipe} 
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 rounded-full w-16 h-16 bg-error-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:opacity-100" 
              value="left" 
              aria-label={`Pass on ${movie.title}`}><PassIcon 
              aria-hidden="true" />
            </button>
            <button onClick={handleSubmit} 
              disabled={isProcessingSwipe} 
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 rounded-full w-16 h-16 bg-success-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:opacity-100" 
              value="right" 
              aria-label={`Add ${movie.title} to watchlist`}><LikeIcon 
              aria-hidden="true" />
            </button>
          </div>
          <button onClick={() => openModal(movie.id)} className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full text-white bg-transparent z-50" aria-label={`View details for ${movie.title}`}>
            <InfoIcon className="w-8 h-8 bg-primary rounded-full" aria-hidden="true" />
          </button>
        </div>
      </article>
      <MovieModal movie={movie} isOpen={modalId === movie.id} closeModal={closeModal} />
    </>
  );
};

export default DiscoverCard;
