import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for authentication pages (Login, Forgot Password, Reset Password, etc.)
 * Provides a centered, simple layout without navigation
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  );
};

export default AuthLayout;

