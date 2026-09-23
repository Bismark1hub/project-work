import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  day_streak: number;
  productivity_score: number;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, isAdmin: user.role === 'admin' }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isAdmin: false }),
    }),
    { name: 'auth-storage' }
  )
);