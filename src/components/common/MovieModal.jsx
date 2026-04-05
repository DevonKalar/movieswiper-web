/**
 * MovieModal component displays detailed information about a movie in a modal dialog.
 * 
 * It includes the movie's poster, title, rating, genres, description, and options to watch or remove from the watchlist.
 * The modal can be closed by clicking the close button or pressing the Escape key.
 * 
 * TO DO: Refactor to use the common Modal component.
 */

import { CloseIcon, StarIcon } from '@icons';
import ScrollableText from "@components/common/ScrollableText";
import { useWatchlist } from '@/queries/useWatchlist';


const MovieModal = ({ movie, isOpen, closeModal }) => {
  const { removeLikedMovie, likedMovies } = useWatchlist();
  if (!isOpen) return null;

	return (
		<div 
      className={`modal-overlay w-full h-full fixed top-0 left-0 flex items-center justify-center z-40 bg-black/50 backdrop-blur-xs fade-in`}
    >
			<div
				className="modal-content max-w-4xl mx-4 bg-primary-500/90 border-2 rounded-2xl shadow-lg relative"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`modal-title-${movie.id}`}
				aria-describedby={`modal-desc-${movie.id}`}
			>
				<div className="flex flex-col md:flex-row gap-4">
					<div className="absolute md:static w-full md:w-1/2 aspect-2/3">
						<img
							className="w-full h-full object-cover rounded-xl inset-0"
							src={movie.posterUrl}
							alt={`Poster for ${movie.title}`}
						/>
					</div>
					<div className="flex flex-col justify-end md:justify-start md:w-1/2 z-50 bg-gradient-to-t aspect-2/3 from-black via-black/90 to-transparent md:bg-none rounded-b-xl py-8 p-4 gap-2">
						{movie.ratings && 
              <div className="border-2 gap-2 flex flex-row justify-start items-center border-primary-700 bg-primary-700 w-fit p-1 px-2 rounded-full">
                <StarIcon className="w-4 h-4 text-accent-500" />
                <p className="text-sm text-white">{movie.ratings.toFixed(1)} </p>
						  </div>}
						<h2 id={`modal-title-${movie.id}`} className="text-5xl">{movie.title}</h2>
						<p className="text-sm text-white mb-2">{movie.genres.join(", ")}</p>
						<ScrollableText id={`modal-desc-${movie.id}`}>{movie.description}</ScrollableText>
						<div className="flex flex-row flex-wrap justify-start items-start gap-2 mt-4">
							<button className="w-full border-2 border-secondary-500"
                aria-label={`Watch ${movie.title}`}>
                Watch Now
              </button>
              {likedMovies.includes(movie) && <button className="w-full bg-transparent border-2 border-error-500 text-error-500" 
                aria-label={`Remove ${movie.title} from watchlist`} 
                onClick={() => removeLikedMovie(movie)}>
                  Remove
              </button>}
						</div>
					</div>
				</div>
				<button
					className="absolute top-4 right-4 w-fit h-fit p-0 rounded-full bg-secondary-500 text-white z-50"
					onClick={() => closeModal()}
					type="button"
					aria-label="Close modal"
				>
					<CloseIcon height={32} width={32} aria-hidden="true" />
				</button>
			</div>
		</div>
	);
};

export default MovieModal;
