import apiClient from './apiClient';

const TIMEOUT = 30000;

export async function getResponse(input: string, instructions: string) {
  const response = await apiClient.post(
    '/openai/response',
    { input, instructions },
    { timeout: TIMEOUT }
  );
  return response.data;
}
