import useAuth from '@providers/AuthContext';
import PromoteAccountForm from '@components/auth/PromoteAccountForm';
import AccountSettingsForm from '@components/auth/AccountSettingsForm';
import { SignOutIcon } from '@icons';

const Account = () => {
  const { isGuest, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <main className="flex-1 py-12 px-4">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-8">
        <div>
          <h1 className="type-display-xs">
            {isGuest ? 'Create Your Account' : 'Account Settings'}
          </h1>
          {isGuest && (
            <p className="type-prose-md mt-2">
              You&apos;re currently a guest. Create a permanent account to keep your watchlist and preferences.
            </p>
          )}
          {!isGuest && user && (
            <div className="flex items-center gap-3 mt-2">
              <p className="type-prose-md">
                Signed in as {user.firstName} {user.lastName} ({user.email})
              </p>
              <button
                onClick={handleLogout}
                className="bg-transparent border-0 p-0 h-fit not-italic font-normal text-text-muted hover:text-text-default flex items-center gap-1 type-label-sm"
              >
                <SignOutIcon height={14} width={14} />
                Log out
              </button>
            </div>
          )}
        </div>
        {isGuest ? <PromoteAccountForm /> : <AccountSettingsForm />}
      </div>
    </main>
  );
};

export default Account;
