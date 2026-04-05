import apiClient from './apiClient';
import { storeTokens, clearTokens, getRefreshToken } from './tokenStorage';
import type { User, AuthResponse, LoginCredentials, RegisterData } from '../types/auth';

const TIMEOUT = 10000;

export async function register(userData: RegisterData): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData, { timeout: TIMEOUT });
  storeTokens(response.data.accessToken, response.data.refreshToken);
  return response.data.user;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials, { timeout: TIMEOUT });
  console.debug('[auth] login response data:', response.data);
  storeTokens(response.data.accessToken, response.data.refreshToken);
  return response.data.user;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  const response = await apiClient.post('/auth/logout', { refreshToken }, { timeout: TIMEOUT });
  clearTokens();
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/check', { timeout: TIMEOUT });
  return response.data;
}
