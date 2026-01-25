import { Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import MainLayout from '@/components/layouts/MainLayout';

// Lazy load HomePage
const HomePage = lazy(() => import('@/pages/client/home/HomePage'));

/**
 * Root redirect component
 * Redirects to login if not authenticated, otherwise renders homepage
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, isAdmin, isSubAdmin, isLecturer, isStudent } = useAuth();

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

  // Redirect based on role
  if (isStudent) {
    return <Navigate to={ROUTES.STUDENT_RESOURCES} replace />;
  }

  if (isAdmin || isSubAdmin || isLecturer) {
    return (
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
    );
  }

  // Fallback for unknown roles
  return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
};

export default RootRedirect;

