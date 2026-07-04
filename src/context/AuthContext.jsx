import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setUnauthorizedHandler } from '../hooks/useApi';

const AuthContext = createContext(null);

// Decode JWT payload without a library (just base64)
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('lifeos-token');
      setUser(null);
    });
  }, []);

  // On mount: check if we have a token that's still valid
  // Skip the API call — just decode the JWT and trust the expiry
  useEffect(() => {
    const token = localStorage.getItem('lifeos-token');
    if (!token) {
      setLoading(false);
      return;
    }

    const payload = decodeToken(token);
    if (!payload || payload.exp * 1000 < Date.now()) {
      // Token expired or invalid
      localStorage.removeItem('lifeos-token');
      setLoading(false);
      return;
    }

    // Token looks valid — set a minimal user and go to dashboard
    // Actual user data will be fetched when the Dashboard loads
    setUser({ id: payload.id, name: payload.name || 'User' });
    setLoading(false);
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
