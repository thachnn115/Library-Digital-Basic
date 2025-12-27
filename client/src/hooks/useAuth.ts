import { useAuthStore } from '@/stores/auth.store';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import type { LoginRequest } from '@/types/auth.types';
import { toast } from 'sonner';

/**
 * Custom hook for authentication
 * Provides auth state and actions
 */
export const useAuth = () => {
  const { 
    user, 
    accessToken, 
    isAuthenticated, 
    isLoading,
    setAuth, 
    logout, 
    updateUser,
    setLoading,
    hasRole,
    hasAnyRole 
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.signIn(data),
    onSuccess: (response) => {
      // Merge mustChangePassword from LoginResponse into user object
      const userWithMustChangePassword = {
        ...response.user,
        mustChangePassword: response.mustChangePassword ?? false,
      };
      setAuth(userWithMustChangePassword, response.accessToken);
      toast.success('Đăng nhập thành công!');
    },
    onError: (error: unknown) => {
      console.error('Login error:', error);
      
      // Extract error message from API response
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { 
              message?: string;
              error?: string;
            };
            status?: number;
          } 
        };
        
        const responseData = axiosError.response?.data;
        const status = axiosError.response?.status;
        
        // Backend trả về ErrorResponse với field 'message'
        if (responseData?.message) {
          // Translate common error messages
          const msg = responseData.message.toLowerCase();
          if (msg.includes('username or password') || msg.includes('incorrect')) {
            errorMessage = 'Email hoặc mật khẩu không đúng.';
          } else if (msg.includes('locked') || msg.includes('khóa')) {
            errorMessage = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
          } else {
            errorMessage = responseData.message;
          }
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng.';
        } else if (status === 403) {
          errorMessage = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.';
        } else if (status === 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      logout();
      toast.success('Đăng xuất thành công!');
    },
    onError: () => {
      // Logout locally even if API fails
      logout();
    },
  });

  const login = (data: LoginRequest) => {
    setLoading(true);
    return loginMutation.mutateAsync(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    
    // Actions
    login,
    logout: handleLogout,
    updateUser,
    
    // Permission helpers
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('ADMIN'),
    isSubAdmin: hasRole('SUB_ADMIN'),
    isLecturer: hasRole('LECTURER'),
  };
};
