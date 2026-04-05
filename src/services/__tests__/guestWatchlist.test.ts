import { describe, it, expect, beforeEach } from 'vitest';
import { getWatchlist, addToWatchlist, removeFromWatchlist, clearWatchlist } from '../guestWatchlist';
import type { Movie } from '@/types/movie';

const GUEST_KEY = 'guestWatchlist';

const movieA: Movie = {
  id: 1,
  title: 'Inception',
  description: 'A thief who steals corporate secrets through dreams',
  posterUrl: '/inception.jpg',
  genres: ['Sci-Fi', 'Thriller'],
  ratings: 8.8,
  releaseDate: '2010-07-16',
};

const movieB: Movie = {
  id: 2,
  title: 'Dune',
  description: 'A noble family becomes embroiled in a war for a desert planet',
  posterUrl: '/dune.jpg',
  genres: ['Sci-Fi', 'Adventure'],
  ratings: 8.0,
  releaseDate: '2021-10-22',
};

function storedMovies(): Movie[] {
  return JSON.parse(localStorage.getItem(GUEST_KEY)!);
}

describe('guestWatchlist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getWatchlist', () => {
    it('returns an empty array when localStorage has no watchlist entry', async () => {
      expect(await getWatchlist()).toEqual([]);
    });

    it('returns the stored movies', async () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA, movieB]));
      expect(await getWatchlist()).toEqual([movieA, movieB]);
    });

    it('returns an empty array when the stored value is corrupted JSON', async () => {
      localStorage.setItem(GUEST_KEY, 'not-valid-json{{{');
      expect(await getWatchlist()).toEqual([]);
    });
  });

  describe('addToWatchlist', () => {
    it('adds a single movie to an empty watchlist', async () => {
      await addToWatchlist(movieA);
      expect(storedMovies()).toEqual([movieA]);
    });

    it('appends to an existing watchlist', async () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA]));
      await addToWatchlist(movieB);
      expect(storedMovies()).toEqual([movieA, movieB]);
    });

    it('adds an array of movies in one call', async () => {
      await addToWatchlist([movieA, movieB]);
      expect(storedMovies()).toEqual([movieA, movieB]);
    });

    it('does not duplicate a movie that is already present', async () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA]));
      await addToWatchlist(movieA);
      expect(storedMovies()).toHaveLength(1);
    });

    it('skips duplicates when adding an array that contains existing movies', async () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA]));
      await addToWatchlist([movieA, movieB]);
      expect(storedMovies()).toHaveLength(2);
      expect(storedMovies()[1]).toEqual(movieB);
    });
  });

  describe('removeFromWatchlist', () => {
    it('removes the movie with the matching id', async () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA, movieB]));
      await removeFromWatchlist(movieA.id);
      expect(storedMovies()).toEqual([movieB]);
    });

    it('is a no-op when the movie id is not in the watchlist', async () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieB]));
      await removeFromWatchlist(movieA.id);
      expect(storedMovies()).toEqual([movieB]);
    });

    it('results in an empty array when the only movie is removed', async () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA]));
      await removeFromWatchlist(movieA.id);
      expect(storedMovies()).toEqual([]);
    });
  });

  describe('clearWatchlist', () => {
    it('removes the watchlist key from localStorage entirely', () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA]));
      clearWatchlist();
      expect(localStorage.getItem(GUEST_KEY)).toBeNull();
    });

    it('does not throw when called on an empty watchlist', () => {
      expect(() => clearWatchlist()).not.toThrow();
    });

    it('only removes the watchlist key, leaving other storage intact', () => {
      localStorage.setItem(GUEST_KEY, JSON.stringify([movieA]));
      localStorage.setItem('accessToken', 'token');
      clearWatchlist();
      expect(localStorage.getItem('accessToken')).toBe('token');
    });
  });
});
