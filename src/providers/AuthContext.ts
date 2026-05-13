import { createContext, useContext } from 'react';
import type { User, LoginCredentials, RegisterData, PromoteAccountData, UpdateAccountData } from '@/types/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  isInitialLoading: boolean;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  createGuestSession: () => Promise<void>;
  promoteAccount: (data: PromoteAccountData) => Promise<void>;
  updateAccount: (data: UpdateAccountData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;