import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setUnauthorizedHandler } from '../hooks/useApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register the global unauthorized handler that calls logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('lifeos-token');
      setUser(null);
    });
  }, []);

  // On mount, check if we have a stored token and validate it
  useEffect(() => {
    const token = localStorage.getItem('lifeos-token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.me()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('lifeos-token');
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('lifeos-token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (email, name, password) => {
    const data = await api.signup(email, name, password);
    localStorage.setItem('lifeos-token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lifeos-token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
