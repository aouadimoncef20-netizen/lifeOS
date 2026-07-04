import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './Dashboard';

function LoadingScreen({ error }) {
  return (
    <div className="h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-deep, #0d0d11)' }}>
      <div className="flex flex-col items-center gap-4">
        <span className="text-3xl text-accent-purple animate-float">⬡</span>
        <span className="text-xl font-extrabold tracking-tight text-themed">Life<span className="text-grad-accent">OS</span></span>
        {error ? (
          <div className="text-xs text-accent-red bg-accent-red/10 px-4 py-2 rounded-lg max-w-xs text-center">
            {error}
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState('login');
  const [loadError, setLoadError] = useState(null);

  // Force-show login after 15s even if loading is stuck
  useEffect(() => {
    if (!loading) {
      setLoadError(null);
      return;
    }
    const t = setTimeout(() => {
      setLoadError('Still loading... Check that the backend server is running:\n  cd server && npm start');
    }, 15000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return <LoadingScreen error={loadError} />;
  }

  if (!user) {
    return authPage === 'login' ? (
      <LoginPage onSwitch={() => setAuthPage('signup')} />
    ) : (
      <SignupPage onSwitch={() => setAuthPage('login')} />
    );
  }

  return <Dashboard />;
}
