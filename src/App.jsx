import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import AuthProvider from '@providers/AuthProvider.jsx';
import MainLayout from '@layouts/MainLayout.jsx';
import DiscoverLayout from '@layouts/DiscoverLayout.jsx';
import NotFound from '@pages/NotFound.jsx';
import WatchList from '@pages/WatchList';
import Discover from '@pages/Discover.jsx';
import AiChat from '@components/chat/AiChat.jsx';

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
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <AiChat />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App;
