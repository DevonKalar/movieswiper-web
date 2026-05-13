import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '@providers/AuthContext';
import { useGuestBanner } from '@providers/GuestBannerProvider';

const GuestBanner = () => {
  const { isGuest } = useAuth();
  const { dismissed, dismiss } = useGuestBanner();
  const [animating, setAnimating] = useState(false);

  if (!isGuest || dismissed) return null;

  const handleDismiss = () => {
    setAnimating(true);
  };

  return (
    <div
      className={`w-full bg-primary/20 border-b border-primary-muted flex items-center justify-center gap-4 relative overflow-hidden transition-all duration-300 ease-in-out ${
        animating ? 'max-h-0 opacity-0 py-0' : 'max-h-24 opacity-100 py-2'
      } px-4`}
      onTransitionEnd={() => animating && dismiss()}
    >
      <p className="type-label-sm text-text-default text-center">
        You&apos;re browsing as a guest. Create an account to save your watchlist permanently.
      </p>
      <Link
        to="/account"
        className="type-label-sm text-primary-muted underline underline-offset-2 whitespace-nowrap"
      >
        Create Account →
      </Link>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 p-1 h-fit not-italic text-text-muted hover:text-text-default leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default GuestBanner;
