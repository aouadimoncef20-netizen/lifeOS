import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setUnauthorizedHandler } from '../hooks/useApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('lifeos-token');
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('lifeos-token');
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    api.me()
      .then(u => { if (!cancelled) { setUser(u); setLoading(false); } })
      .catch(e => {
        if (!cancelled) {
          localStorage.removeItem('lifeos-token');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
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
