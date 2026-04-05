import { describe, it, expect, beforeEach } from 'vitest';
import { storeTokens, getAccessToken, getRefreshToken, clearTokens } from '../tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('storeTokens', () => {
    it('persists both access and refresh tokens to localStorage', () => {
      storeTokens('access-abc', 'refresh-xyz');
      expect(localStorage.getItem('accessToken')).toBe('access-abc');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-xyz');
    });

    it('overwrites existing tokens', () => {
      storeTokens('old-access', 'old-refresh');
      storeTokens('new-access', 'new-refresh');
      expect(localStorage.getItem('accessToken')).toBe('new-access');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });
  });

  describe('getAccessToken', () => {
    it('returns null when no access token has been stored', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('returns the stored access token', () => {
      localStorage.setItem('accessToken', 'my-access-token');
      expect(getAccessToken()).toBe('my-access-token');
    });
  });

  describe('getRefreshToken', () => {
    it('returns null when no refresh token has been stored', () => {
      expect(getRefreshToken()).toBeNull();
    });

    it('returns the stored refresh token', () => {
      localStorage.setItem('refreshToken', 'my-refresh-token');
      expect(getRefreshToken()).toBe('my-refresh-token');
    });
  });

  describe('clearTokens', () => {
    it('removes both tokens from localStorage', () => {
      localStorage.setItem('accessToken', 'access');
      localStorage.setItem('refreshToken', 'refresh');
      clearTokens();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('does not throw when no tokens are stored', () => {
      expect(() => clearTokens()).not.toThrow();
    });

    it('only removes token keys, leaving unrelated storage intact', () => {
      localStorage.setItem('accessToken', 'access');
      localStorage.setItem('refreshToken', 'refresh');
      localStorage.setItem('guestWatchlist', '[]');
      clearTokens();
      expect(localStorage.getItem('guestWatchlist')).toBe('[]');
    });
  });
});
