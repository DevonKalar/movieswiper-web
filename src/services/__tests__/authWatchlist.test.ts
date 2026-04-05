import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../apiClient';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../authWatchlist';
import type { Movie } from '@/types/movie';

const mock = new MockAdapter(apiClient);

const movie: Movie = {
  id: 42,
  title: 'Parasite',
  description: 'Greed and class discrimination threaten a symbiotic relationship',
  posterUrl: '/parasite.jpg',
  genres: ['Thriller', 'Drama'],
  ratings: 8.5,
  releaseDate: '2019-11-08',
};

const secondMovie: Movie = { ...movie, id: 99, title: 'Oldboy' };

describe('authWatchlist', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  describe('getWatchlist', () => {
    it('maps the server { watchlist: [{ movie }] } shape to a flat Movie[]', async () => {
      mock.onGet('/watchlist').reply(200, {
        watchlist: [{ movie }, { movie: secondMovie }],
      });
      const result = await getWatchlist();
      expect(result).toEqual([movie, secondMovie]);
    });

    it('returns an empty array when the server watchlist is empty', async () => {
      mock.onGet('/watchlist').reply(200, { watchlist: [] });
      expect(await getWatchlist()).toEqual([]);
    });

    it('throws a timeout error when the server does not respond', async () => {
      mock.onGet('/watchlist').timeout();
      await expect(getWatchlist()).rejects.toThrow('Request timeout - server did not respond in time');
    });

    it('throws the server error message on a 5xx response', async () => {
      mock.onGet('/watchlist').reply(500, { message: 'Internal server error' });
      await expect(getWatchlist()).rejects.toThrow('Internal server error');
    });
  });

  describe('addToWatchlist', () => {
    it('wraps a single movie in an array before sending', async () => {
      mock.onPost('/watchlist').reply(201);
      await addToWatchlist(movie);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ movies: [movie] });
    });

    it('sends an array of movies without double-wrapping', async () => {
      mock.onPost('/watchlist').reply(201);
      await addToWatchlist([movie, secondMovie]);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ movies: [movie, secondMovie] });
    });

    it('throws a timeout error when the server does not respond', async () => {
      mock.onPost('/watchlist').timeout();
      await expect(addToWatchlist(movie)).rejects.toThrow('Request timeout - server did not respond in time');
    });

    it('throws the server error message on a 4xx response', async () => {
      mock.onPost('/watchlist').reply(400, { message: 'Invalid movie data' });
      await expect(addToWatchlist(movie)).rejects.toThrow('Invalid movie data');
    });
  });

  describe('removeFromWatchlist', () => {
    it('sends DELETE to /watchlist/:id with the correct id', async () => {
      mock.onDelete('/watchlist/42').reply(200);
      await removeFromWatchlist(42);
      expect(mock.history.delete).toHaveLength(1);
      expect(mock.history.delete[0].url).toContain('/watchlist/42');
    });

    it('throws a timeout error when the server does not respond', async () => {
      mock.onDelete('/watchlist/42').timeout();
      await expect(removeFromWatchlist(42)).rejects.toThrow('Request timeout - server did not respond in time');
    });

    it('throws the server error message on a 404 response', async () => {
      mock.onDelete('/watchlist/42').reply(404, { message: 'Movie not found in watchlist' });
      await expect(removeFromWatchlist(42)).rejects.toThrow('Movie not found in watchlist');
    });
  });
});
