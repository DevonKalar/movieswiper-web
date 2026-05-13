import { useState } from 'react';
import useAuth from '@providers/AuthContext';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

type Tab = 'options' | 'login' | 'register';

const AuthGate = () => {
  const { createGuestSession, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('options');

  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
    >
      <div className="bg-surface border-2 rounded-2xl shadow-lg w-full max-w-md mx-4 p-8 flex flex-col gap-4">

        {tab === 'options' && (
          <>
            <div>
              <h2 id="auth-gate-title" className="type-heading-md">Welcome to MovieSwiper</h2>
              <p className="type-prose-md mt-2">Sign in, create an account, or continue as a guest.</p>
            </div>
            <button
              className="border-2 bg-transparent border-primary-muted text-primary-muted"
              onClick={createGuestSession}
              disabled={isLoading}
            >
              Continue as Guest
            </button>
            <div className="flex items-center gap-3">
              <hr className="flex-1 border-border-strong" />
              <span className="type-label-sm text-text-muted">or continue with account</span>
              <hr className="flex-1 border-border-strong" />
            </div>
            <button onClick={() => setTab('register')}>
              Create Account
            </button>
            <button
              className="border-2 bg-transparent border-primary-muted text-primary-muted"
              onClick={() => setTab('login')}
            >
              Login
            </button>
          </>
        )}

        {tab === 'login' && (
          <>
            <button
              className="self-start p-0 bg-transparent h-fit w-fit text-text-muted type-label-sm"
              onClick={() => setTab('options')}
              type="button"
            >
              ← Back
            </button>
            <LoginForm />
          </>
        )}

        {tab === 'register' && (
          <>
            <button
              className="self-start p-0 bg-transparent h-fit w-fit text-text-muted type-label-sm"
              onClick={() => setTab('options')}
              type="button"
            >
              ← Back
            </button>
            <SignUpForm />
          </>
        )}

      </div>
    </div>
  );
};

export default AuthGate;
