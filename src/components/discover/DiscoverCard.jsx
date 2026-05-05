import { PassIcon, HeartIcon, RejectIcon, InfoIcon } from '@icons';
import MovieModal from "../common/MovieModal";
import { useModal } from "@hooks/useModal";

const DiscoverCard = ({ movie, onLike, onReject, isLiked, isRejected, reactionAnimation }) => {
  const { modalId, openModal, closeModal } = useModal();

  const overlayClass = reactionAnimation === 'like'
    ? 'animate-overlay-like'
    : reactionAnimation === 'reject'
      ? 'animate-overlay-reject'
      : '';

  return (
    <>
      <article className="relative w-full max-w-[min(500px,calc((100dvh-10rem)*2/3))] aspect-[2/3] mx-auto overflow-hidden select-none rounded-2xl">
        <img
          className="w-full h-full object-cover"
          src={movie.posterUrl}
          alt={`${movie.title} movie poster`}
          draggable={false}
        />

        <button
          onClick={() => openModal(movie.id)}
          className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full text-white bg-transparent z-10"
          aria-label={`View details for ${movie.title}`}
        >
          <InfoIcon className="w-8 h-8 bg-primary rounded-full" aria-hidden="true" />
        </button>

        <div className="absolute bottom-6 right-4 flex flex-col gap-3 z-10">
          <button
            onClick={onReject}
            className={`not-italic font-normal p-0 w-14 h-14 rounded-full shadow-lg border-2 transition-colors
              ${isRejected ? 'bg-error-500 border-error-500 text-white' : 'bg-black/30 border-error-500 text-error-500'}`}
            aria-label={`Pass on ${movie.title}`}
          >
            <PassIcon />
          </button>
          <button
            onClick={onLike}
            className={`not-italic font-normal p-0 w-14 h-14 rounded-full shadow-lg border-2 transition-colors
              ${isLiked ? 'bg-success-500 border-success-500 text-white' : 'bg-black/30 border-success-500 text-success-500'}`}
            aria-label={`Like ${movie.title}`}
          >
            <HeartIcon />
          </button>
        </div>

        {overlayClass && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
              reactionAnimation === 'like' ? 'bg-success-500/60' : 'bg-error-500/60'
            } ${overlayClass}`}
          >
            {reactionAnimation === 'like'
              ? <HeartIcon width={56} height={56} className="text-white" />
              : <PassIcon width={56} height={56} className="text-white" />
            }
            <span className="text-white font-bold text-2xl tracking-wide">
              {reactionAnimation === 'like' ? 'Liked!' : 'Nope!'}
            </span>
          </div>
        )}
      </article>

      <MovieModal movie={movie} isOpen={modalId === movie.id} closeModal={closeModal} />
    </>
  );
};

export default DiscoverCard;
