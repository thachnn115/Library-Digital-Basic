import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfo } from '@/types/auth.types';

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: UserInfo, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<UserInfo>) => void;
  setLoading: (isLoading: boolean) => void;
  hasRole: (role: 'ADMIN' | 'SUB_ADMIN' | 'LECTURER') => boolean;
  hasAnyRole: (roles: ('ADMIN' | 'SUB_ADMIN' | 'LECTURER')[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAuth: (user, accessToken) => {
        // Lưu token vào localStorage để axios interceptor sử dụng
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_info', JSON.stringify(user));

        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Xóa token khỏi localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (updatedUser) => {
        const currentUser = get().user;
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('user_info', JSON.stringify(newUser));
          set({ user: newUser });
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      hasRole: (role) => {
        const user = get().user;
        if (!user) return false;
        return user.role === role || user.type === role;
      },

      hasAnyRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.role as 'ADMIN' | 'SUB_ADMIN' | 'LECTURER') || 
               roles.includes(user.type);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

