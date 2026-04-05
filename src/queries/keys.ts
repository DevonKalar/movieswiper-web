export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'currentUser'] as const,
  },
  watchlist: {
    all: ['watchlist'] as const,
    list: () => [...queryKeys.watchlist.all, 'list'] as const,
    guest: () => [...queryKeys.watchlist.all, 'guest'] as const,
    rejected: () => [...queryKeys.watchlist.all, 'rejected'] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
  },
};