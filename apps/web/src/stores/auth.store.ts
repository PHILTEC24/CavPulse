import { create } from 'zustand';
import { AuthUser, UserRole } from '@cavpulse/shared';
import apiClient from '../lib/api';
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
  clearAuthStorage,
} from '../lib/auth';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  setUser: (user: AuthUser | null) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  setUser: (user: AuthUser | null) => {
    setStoredUser(user);
    set({ user, isAuthenticated: !!user });
  },

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;

      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }

      setAccessToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);
      setStoredUser(user);

      set({
        user,
        accessToken,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: unknown) {
      let message = 'Invalid email or password';
      if (err && typeof err === 'object' && 'response' in err) {
        const axErr = err as { response?: { data?: { message?: string } } };
        message = axErr.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      clearAuthStorage();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  },

  refreshTokens: async (): Promise<boolean> => {
    const token = getRefreshToken();
    if (!token) {
      get().logout();
      return false;
    }

    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: token,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      setAccessToken(accessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);

      set({
        accessToken,
        refreshToken: newRefreshToken || token,
      });
      return true;
    } catch {
      get().logout();
      return false;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const storedToken = getAccessToken();
    const storedUser = getStoredUser();

    if (!storedToken || !storedUser) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({
      user: storedUser,
      accessToken: storedToken,
      refreshToken: getRefreshToken(),
      isAuthenticated: true,
    });

    try {
      // Validate token with me endpoint in background
      const response = await apiClient.get('/auth/me');
      if (response.data) {
        const freshUser = response.data;
        setStoredUser(freshUser);
        set({ user: freshUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      // If /auth/me fails with non-auth, keep stored user; if 401, interceptor handled it
      set({ isLoading: false });
    }
  },
}));

