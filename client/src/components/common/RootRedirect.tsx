import { Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';

// Lazy load HomePage
const HomePage = lazy(() => import('@/pages/client/home/HomePage'));

/**
 * Root redirect component
 * Redirects to login if not authenticated, otherwise renders homepage
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Render homepage with layout if authenticated
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'SUB_ADMIN', 'LECTURER']}>
      <MainLayout>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Spin size="large" />
            </div>
          }
        >
          <HomePage />
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default RootRedirect;

