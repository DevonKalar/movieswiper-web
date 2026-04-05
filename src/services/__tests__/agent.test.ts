import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../apiClient';
import { getResponse } from '../agent';

const mock = new MockAdapter(apiClient);

describe('agent', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  it('sends input and instructions in the request body', async () => {
    mock.onPost('/openai/response').reply(200, { reply: 'Some AI response' });
    await getResponse('What is a good action movie?', 'You are a movie expert.');
    expect(JSON.parse(mock.history.post[0].data)).toEqual({
      input: 'What is a good action movie?',
      instructions: 'You are a movie expert.',
    });
  });

  it('returns the full response data from the API', async () => {
    const aiReply = { reply: 'I recommend Parasite', tokens: 42 };
    mock.onPost('/openai/response').reply(200, aiReply);
    const result = await getResponse('Recommend something', 'Be concise.');
    expect(result).toEqual(aiReply);
  });

  it('throws a timeout error when the server does not respond within 30 seconds', async () => {
    mock.onPost('/openai/response').timeout();
    await expect(getResponse('hello', 'instructions')).rejects.toThrow(
      'Request timeout - server did not respond in time'
    );
  });

  it('throws the server error message on a 5xx response', async () => {
    mock.onPost('/openai/response').reply(503, { message: 'AI service temporarily unavailable' });
    await expect(getResponse('hello', 'instructions')).rejects.toThrow(
      'AI service temporarily unavailable'
    );
  });

  it('throws the server error message on a 4xx response', async () => {
    mock.onPost('/openai/response').reply(400, { message: 'Invalid request format' });
    await expect(getResponse('', '')).rejects.toThrow('Invalid request format');
  });
});
