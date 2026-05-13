import { Link } from 'react-router-dom';
import useAuth from '@providers/AuthContext';

const GuestBanner = () => {
  const { isGuest } = useAuth();
  if (!isGuest) return null;

  return (
    <div className="w-full bg-primary/20 border-b border-primary-muted px-4 py-2 flex items-center justify-between gap-4">
      <p className="type-label-sm text-text-default">
        You&apos;re browsing as a guest. Create an account to save your watchlist permanently.
      </p>
      <Link
        to="/account"
        className="type-label-sm text-primary-muted underline underline-offset-2 whitespace-nowrap"
      >
        Create Account →
      </Link>
    </div>
  );
};

export default GuestBanner;
