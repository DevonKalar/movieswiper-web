import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../apiClient';

const mock = new MockAdapter(apiClient);

describe('apiClient', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  describe('request interceptor', () => {
    it('attaches a Bearer token when an access token is in localStorage', async () => {
      localStorage.setItem('accessToken', 'my-access-token');
      mock.onGet('/test').reply(200, {});
      await apiClient.get('/test');
      expect(mock.history.get[0].headers?.Authorization).toBe('Bearer my-access-token');
    });

    it('omits the Authorization header when no access token is stored', async () => {
      mock.onGet('/test').reply(200, {});
      await apiClient.get('/test');
      expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
    });

    it('picks up a token stored between requests', async () => {
      mock.onGet('/first').reply(200, {});
      mock.onGet('/second').reply(200, {});
      await apiClient.get('/first');
      localStorage.setItem('accessToken', 'late-token');
      await apiClient.get('/second');
      expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
      expect(mock.history.get[1].headers?.Authorization).toBe('Bearer late-token');
    });
  });

  describe('response interceptor — error classification', () => {
    it('converts a network timeout (ECONNABORTED) to a human-readable error', async () => {
      mock.onGet('/test').timeout();
      await expect(apiClient.get('/test')).rejects.toThrow(
        'Request timeout - server did not respond in time'
      );
    });

    it('throws the server-provided message on a 4xx response', async () => {
      mock.onGet('/test').reply(400, { message: 'Bad request payload' });
      await expect(apiClient.get('/test')).rejects.toThrow('Bad request payload');
    });

    it('falls back to "HTTP Error <status>" when the server provides no message', async () => {
      mock.onGet('/test').reply(404);
      await expect(apiClient.get('/test')).rejects.toThrow('HTTP Error 404');
    });

    it('throws the server message on a 5xx response', async () => {
      mock.onGet('/test').reply(500, { message: 'Database connection failed' });
      await expect(apiClient.get('/test')).rejects.toThrow('Database connection failed');
    });
  });

  describe('response interceptor — token refresh on 401', () => {
    it('retries the original request with the new access token after a successful refresh', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      mock.onGet('/protected').replyOnce(401, { message: 'Unauthorized' });
      mock.onPost('/auth/refresh').replyOnce(200, { accessToken: 'fresh-access-token' });
      mock.onGet('/protected').replyOnce(200, { secret: 'data' });

      const result = await apiClient.get('/protected');
      expect(result.data).toEqual({ secret: 'data' });
    });

    it('stores the new access token in localStorage after a successful refresh', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      mock.onGet('/protected').replyOnce(401, {});
      mock.onPost('/auth/refresh').replyOnce(200, { accessToken: 'fresh-access-token' });
      mock.onGet('/protected').replyOnce(200, {});

      await apiClient.get('/protected');
      expect(localStorage.getItem('accessToken')).toBe('fresh-access-token');
    });

    it('sends the stored refresh token to the /auth/refresh endpoint', async () => {
      localStorage.setItem('refreshToken', 'my-refresh-token');
      mock.onGet('/protected').replyOnce(401, {});
      mock.onPost('/auth/refresh').replyOnce(200, { accessToken: 'new-token' });
      mock.onGet('/protected').replyOnce(200, {});

      await apiClient.get('/protected');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ refreshToken: 'my-refresh-token' });
    });

    it('throws "Session expired" when there is no refresh token stored', async () => {
      mock.onGet('/protected').reply(401, { message: 'Unauthorized' });
      await expect(apiClient.get('/protected')).rejects.toThrow(
        'Session expired. Please log in again.'
      );
    });

    it('throws "Session expired" when the refresh endpoint itself returns an error', async () => {
      localStorage.setItem('refreshToken', 'expired-refresh-token');
      mock.onGet('/protected').replyOnce(401, {});
      mock.onPost('/auth/refresh').replyOnce(401, { message: 'Refresh token expired' });

      await expect(apiClient.get('/protected')).rejects.toThrow(
        'Session expired. Please log in again.'
      );
    });

    it('does not retry more than once for a given 401 response', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh');
      mock.onGet('/protected').reply(401, { message: 'Unauthorized' });
      mock.onPost('/auth/refresh').reply(200, { accessToken: 'new-token' });

      await expect(apiClient.get('/protected')).rejects.toThrow();
      expect(mock.history.get.filter((r) => r.url?.includes('/protected'))).toHaveLength(2);
    });

    it('issues only one refresh request when multiple calls expire simultaneously', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh');
      mock.onGet('/resource-a').replyOnce(401, {});
      mock.onGet('/resource-b').replyOnce(401, {});
      mock.onPost('/auth/refresh').replyOnce(200, { accessToken: 'new-token' });
      mock.onGet('/resource-a').replyOnce(200, { payload: 'a' });
      mock.onGet('/resource-b').replyOnce(200, { payload: 'b' });

      const [a, b] = await Promise.all([apiClient.get('/resource-a'), apiClient.get('/resource-b')]);
      expect(a.data).toEqual({ payload: 'a' });
      expect(b.data).toEqual({ payload: 'b' });
      expect(mock.history.post.filter((r) => r.url?.includes('/auth/refresh'))).toHaveLength(1);
    });
  });
});
