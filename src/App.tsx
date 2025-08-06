import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { SignupSuccessPage } from './components/auth/SignupSuccessPage';
import { VendorDashboard } from './components/dashboards/VendorDashboard';
import { CenterDashboard } from './components/dashboards/CenterDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { Toaster } from './components/ui/Toaster';
import { User, UserRole } from './types';

type AuthView = 'login' | 'signup' | 'signup-success';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('vrs_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('vrs_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vrs_user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    const renderAuthView = () => {
      switch (authView) {
        case 'login':
          return (
            <LoginPage 
              onLogin={handleLogin} 
              onShowSignup={() => setAuthView('signup')}
            />
          );
        case 'signup':
          return (
            <SignupPage 
              onShowLogin={() => setAuthView('login')}
              onSignupSuccess={() => setAuthView('signup-success')}
            />
          );
        case 'signup-success':
          return (
            <SignupSuccessPage 
              onShowLogin={() => setAuthView('login')}
            />
          );
        default:
          return (
            <LoginPage 
              onLogin={handleLogin} 
              onShowSignup={() => setAuthView('signup')}
            />
          );
      }
    };

    return (
      <>
        {renderAuthView()}
        <Toaster />
      </>
    );
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case UserRole.VENDOR:
        return <VendorDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.CENTER:
        return <CenterDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.ADMIN:
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <Toaster />
    </>
  );
}

export default App;