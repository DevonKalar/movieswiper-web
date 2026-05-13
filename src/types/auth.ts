export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isGuest?: boolean;
}

export interface PromoteAccountData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface UpdateAccountData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}