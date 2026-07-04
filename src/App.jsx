import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './Dashboard';

export default function App() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'signup'

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-deep)' }}>
        <div className="flex flex-col items-center gap-4">
          <span className="text-3xl text-accent-purple animate-float">⬡</span>
          <span className="text-xl font-extrabold tracking-tight text-themed">Life<span className="text-grad-accent">OS</span></span>
          <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
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
