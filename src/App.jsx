import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import AuthProvider from '@providers/AuthProvider.jsx';
import GuestBannerProvider from '@providers/GuestBannerProvider';
import useAuth from '@providers/AuthContext';
import MainLayout from '@layouts/MainLayout.jsx';
import DiscoverLayout from '@layouts/DiscoverLayout.jsx';
import NotFound from '@pages/NotFound.jsx';
import WatchList from '@pages/WatchList';
import Discover from '@pages/Discover.jsx';
import Account from '@pages/Account';
import AiChat from '@components/chat/AiChat.jsx';
import AuthGate from '@components/auth/AuthGate';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: attempts => Math.min(1000 * 2 ** attempts, 30000) + Math.random() * 1000,
    }
  }
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<DiscoverLayout />}>
        <Route index element={<Discover />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="watchlist" element={<WatchList />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
);

function AppContent() {
  const { user, isInitialLoading } = useAuth();
  const showAuthGate = !isInitialLoading && !user;

  return (
    <>
      <RouterProvider router={router} />
      <AiChat />
      {showAuthGate && <AuthGate />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GuestBannerProvider>
          <AppContent />
        </GuestBannerProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App;
