import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../hooks/useApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lifeos-token');
    if (token) {
      api.me()
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem('lifeos-token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
