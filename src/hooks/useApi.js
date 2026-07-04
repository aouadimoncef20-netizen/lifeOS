const API = process.env.REACT_APP_API_URL || '/api';

function getToken() {
  return localStorage.getItem('lifeos-token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);

  const res = await fetch(API + path, opts);
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('lifeos-token');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  signup: (email, name, password) => request('POST', '/auth/signup', { email, name, password }),
  me: () => request('GET', '/auth/me'),

  // Tasks
  getTasks: () => request('GET', '/tasks'),
  createTask: (data) => request('POST', '/tasks', data),
  updateTask: (id, data) => request('PUT', '/tasks/' + id, data),
  deleteTask: (id) => request('DELETE', '/tasks/' + id),

  // Habits
  getHabits: () => request('GET', '/habits'),
  updateHabit: (id, data) => request('PUT', '/habits/' + id, data),

  // Settings
  getSettings: () => request('GET', '/settings'),
  updateSettings: (data) => request('PUT', '/settings', data),
};
