import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../apiClient';
import { fetchRecommendations } from '../recommendations';
import type { Movie } from '@/types/movie';

const mock = new MockAdapter(apiClient);

const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Parasite',
    description: 'Class war thriller',
    posterUrl: '/parasite.jpg',
    genres: ['Thriller', 'Drama'],
    ratings: 8.5,
    releaseDate: '2019-11-08',
  },
  {
    id: 2,
    title: 'Dune',
    description: 'Epic space opera',
    posterUrl: '/dune.jpg',
    genres: ['Sci-Fi', 'Adventure'],
    ratings: 8.0,
    releaseDate: '2021-10-22',
  },
];

describe('recommendations', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  it('defaults to page 1 when no argument is provided', async () => {
    mock.onGet('/recommendations').reply(200, { results: mockMovies });
    await fetchRecommendations();
    expect(mock.history.get[0].params).toEqual({ page: 1 });
  });

  it('sends the specified page number as a query param', async () => {
    mock.onGet('/recommendations').reply(200, { results: mockMovies });
    await fetchRecommendations(4);
    expect(mock.history.get[0].params).toEqual({ page: 4 });
  });

  it('returns the full { results } response shape', async () => {
    mock.onGet('/recommendations').reply(200, { results: mockMovies });
    const result = await fetchRecommendations();
    expect(result).toEqual({ results: mockMovies });
  });

  it('throws a timeout error when the server does not respond', async () => {
    mock.onGet('/recommendations').timeout();
    await expect(fetchRecommendations()).rejects.toThrow(
      'Request timeout - server did not respond in time'
    );
  });

  it('throws the server error message on a 5xx response', async () => {
    mock.onGet('/recommendations').reply(503, { message: 'Recommendation engine offline' });
    await expect(fetchRecommendations()).rejects.toThrow('Recommendation engine offline');
  });
});
