import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const authenticatedFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    return fetch(url, { ...options, headers });
  }, []);

  const handleAuth = useCallback(async (isLogin: boolean) => {
    const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Auth failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setShowAuth(false);
      return true;
    } catch {
      return false;
    }
  }, [email, password]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setShowProfile(false);
  }, []);

  const ensureDevAuth = useCallback(async () => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      const meRes = await authenticatedFetch('/auth/me');
      if (meRes.ok) {
        const data = await meRes.json();
        setUser(data);
        return;
      }
    }
    const credentials = { email: 'dev@stumble.local', password: 'devpass' };
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (registerRes.ok) {
      const data = await registerRes.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return;
    }
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      authenticatedFetch('/auth/me')
        .then(async res => {
          if (res.ok) {
            const text = await res.text();
            try {
              const data = JSON.parse(text);
              setUser(data);
            } catch { /* ignore */ }
          }
        });
    }
  }, [authenticatedFetch]);

  return {
    user,
    showAuth,
    showProfile,
    email,
    password,
    setShowAuth,
    setShowProfile,
    setEmail,
    setPassword,
    authenticatedFetch,
    handleAuth,
    logout,
    ensureDevAuth,
  };
}