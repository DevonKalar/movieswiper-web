import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '../apiClient';
import { register, login, logout, getCurrentUser } from '../auth';

const mock = new MockAdapter(apiClient);

const mockUser = {
  id: 'user-123',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
};

const mockAuthResponse = {
  user: mockUser,
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
};

const registerData = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'Password123!',
};

const loginCredentials = {
  email: 'jane@example.com',
  password: 'Password123!',
};

describe('auth', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  describe('register', () => {
    it('returns the user object from the server response', async () => {
      mock.onPost('/auth/register').reply(200, mockAuthResponse);
      const result = await register(registerData);
      expect(result).toEqual(mockUser);
    });

    it('stores both tokens in localStorage after successful registration', async () => {
      mock.onPost('/auth/register').reply(200, mockAuthResponse);
      await register(registerData);
      expect(localStorage.getItem('accessToken')).toBe('access-token-abc');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token-xyz');
    });

    it('sends all registration fields in the request body', async () => {
      mock.onPost('/auth/register').reply(200, mockAuthResponse);
      await register(registerData);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(registerData);
    });

    it('throws the server message on a 400 response', async () => {
      mock.onPost('/auth/register').reply(400, { message: 'Email already in use' });
      await expect(register(registerData)).rejects.toThrow('Email already in use');
    });

    it('throws a timeout error when the server does not respond', async () => {
      mock.onPost('/auth/register').timeout();
      await expect(register(registerData)).rejects.toThrow('Request timeout - server did not respond in time');
    });

    it('does not store tokens when registration fails', async () => {
      mock.onPost('/auth/register').reply(400, { message: 'Email already in use' });
      await expect(register(registerData)).rejects.toThrow();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('login', () => {
    it('returns the user object from the server response', async () => {
      mock.onPost('/auth/login').reply(200, mockAuthResponse);
      const result = await login(loginCredentials);
      expect(result).toEqual(mockUser);
    });

    it('stores both tokens in localStorage after successful login', async () => {
      mock.onPost('/auth/login').reply(200, mockAuthResponse);
      await login(loginCredentials);
      expect(localStorage.getItem('accessToken')).toBe('access-token-abc');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token-xyz');
    });

    it('sends email and password in the request body', async () => {
      mock.onPost('/auth/login').reply(200, mockAuthResponse);
      await login(loginCredentials);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(loginCredentials);
    });

    it('throws the server message on a 400 response', async () => {
      mock.onPost('/auth/login').reply(400, { message: 'Invalid credentials' });
      await expect(login(loginCredentials)).rejects.toThrow('Invalid credentials');
    });

    it('throws a timeout error when the server does not respond', async () => {
      mock.onPost('/auth/login').timeout();
      await expect(login(loginCredentials)).rejects.toThrow('Request timeout - server did not respond in time');
    });

    it('does not store tokens when login fails', async () => {
      mock.onPost('/auth/login').reply(400, { message: 'Invalid credentials' });
      await expect(login(loginCredentials)).rejects.toThrow();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('logout', () => {
    it('sends the stored refresh token in the request body', async () => {
      localStorage.setItem('refreshToken', 'my-refresh-token');
      mock.onPost('/auth/logout').reply(200, { message: 'Logged out' });
      await logout();
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ refreshToken: 'my-refresh-token' });
    });

    it('clears both tokens from localStorage after successful logout', async () => {
      localStorage.setItem('accessToken', 'access');
      localStorage.setItem('refreshToken', 'refresh');
      mock.onPost('/auth/logout').reply(200, { message: 'Logged out' });
      await logout();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('returns the response data on success', async () => {
      mock.onPost('/auth/logout').reply(200, { message: 'Logged out successfully' });
      const result = await logout();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('throws on a server error', async () => {
      mock.onPost('/auth/logout').reply(500, { message: 'Internal Server Error' });
      await expect(logout()).rejects.toThrow(Error);
    });
  });

  describe('getCurrentUser', () => {
    it('returns the current user on success', async () => {
      mock.onGet('/auth/check').reply(200, mockUser);
      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('throws a timeout error when the server does not respond', async () => {
      mock.onGet('/auth/check').timeout();
      await expect(getCurrentUser()).rejects.toThrow('Request timeout - server did not respond in time');
    });
  });
});
