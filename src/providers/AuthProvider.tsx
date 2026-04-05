import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import { getCurrentUser, login, logout, register } from '@services/auth';
import { addToWatchlist } from '@services/authWatchlist';
import { getWatchlist as getGuestWatchlist, clearWatchlist as clearGuestWatchlist } from '@services/guestWatchlist';
import { queryKeys } from '@/queries/keys';
import type { LoginCredentials, RegisterData } from '@/types/auth';
import type { ProviderProps } from '@/types/provider';

async function syncGuestWatchlist(): Promise<void> {
  const guestMovies = await getGuestWatchlist();
  if (guestMovies.length > 0) {
    await addToWatchlist(guestMovies);
  }
  clearGuestWatchlist();
}

const AuthProvider = ({ children }: ProviderProps) => {
  const queryClient = useQueryClient();

  const { data: user, isError, isPending: isCheckingAuth } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: getCurrentUser,
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.auth.currentUser(), data);
      await syncGuestWatchlist();
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.list() });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.currentUser(), null);
      queryClient.removeQueries({ queryKey: queryKeys.watchlist.all });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.auth.currentUser(), data);
      await syncGuestWatchlist();
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.list() });
    },
  });

  const isAuthenticated = !isError && !!user?.id;
  const isLoading =
    isCheckingAuth ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    registerMutation.isPending;
  const error = (loginMutation.error ||
    logoutMutation.error ||
    registerMutation.error) as Error | null;

  async function handleLogin(credentials: LoginCredentials): Promise<void> {
    await loginMutation.mutateAsync(credentials);
  }

  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
  }

  async function handleRegister(registerData: RegisterData): Promise<void> {
    await registerMutation.mutateAsync(registerData);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: user ?? null,
        isLoading,
        error,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
