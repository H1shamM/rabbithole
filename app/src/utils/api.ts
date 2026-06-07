const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  return response;
}