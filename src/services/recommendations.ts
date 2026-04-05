import apiClient from './apiClient';
import { Movie } from '@/types/movie';

const TIMEOUT = 15000;

export async function fetchRecommendations(page = 1) {
  const response = await apiClient.get<{ results: Movie[] }>('/recommendations', {
    timeout: TIMEOUT,
    params: { page },
  });
  return response.data;
}