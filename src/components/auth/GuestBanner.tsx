import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '@providers/AuthContext';
import { useGuestBanner } from '@providers/GuestBannerProvider';

const GuestBanner = () => {
  const { isGuest } = useAuth();
  const { dismissed, dismiss } = useGuestBanner();
  const [animating, setAnimating] = useState(false);

  if (!isGuest || dismissed) return null;

  const handleDismiss = () => setAnimating(true);

  const dismissBtn = (
    <button
      onClick={handleDismiss}
      className="bg-transparent border-0 p-1 h-fit not-italic text-text-muted hover:text-text-default leading-none"
      aria-label="Dismiss"
    >
      ✕
    </button>
  );

  return (
    <div
      className={`w-full bg-primary/20 border-b border-primary-muted overflow-hidden transition-all duration-300 ease-in-out px-4 ${
        animating ? 'max-h-0 opacity-0 py-0' : 'max-h-40 opacity-100 py-2'
      }`}
      onTransitionEnd={() => animating && dismiss()}
    >
      {/* Mobile: stacked left, close top-right */}
      <div className="flex md:hidden relative pr-8">
        <div className="flex flex-col items-start gap-1">
          <p className="type-label-sm text-text-default">
            Create an account to save your watchlist permanently.
          </p>
          <Link
            to="/account"
            className="type-label-sm text-primary-muted underline underline-offset-2"
          >
            Create Account →
          </Link>
        </div>
        <div className="absolute top-0 right-0">{dismissBtn}</div>
      </div>

      {/* Desktop: centered 3-col grid */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <div className="flex items-center gap-3">
          <p className="type-label-sm text-text-default">
            Create an account to save your watchlist permanently.
          </p>
          <Link
            to="/account"
            className="type-label-sm text-primary-muted underline underline-offset-2 whitespace-nowrap"
          >
            Create Account →
          </Link>
        </div>
        <div className="flex justify-end">{dismissBtn}</div>
      </div>
    </div>
  );
};

export default GuestBanner;
