const API = process.env.REACT_APP_API_URL || '/api';

let _onUnauthorized = null;

export function setUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

function getToken() {
  try { return localStorage.getItem('lifeos-token'); } catch { return null; }
}

export async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(API + path, opts);
  } catch (err) {
    // Network error — server not running or CORS issue
    throw new Error(
      'Cannot reach the server. Make sure the backend is running on port 4000.\n' +
      'Run: cd server && npm start\n' +
      'Error: ' + err.message
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Server returned invalid response (not JSON). Check if the backend is running.');
  }

  if (!res.ok) {
    if (res.status === 401 && _onUnauthorized) {
      _onUnauthorized();
    }
    throw new Error(data.error || 'Request failed (status ' + res.status + ')');
  }
  return data;
}

export const api = {
  login:     (email, password)        => request('POST', '/auth/login', { email, password }),
  signup:    (email, name, password)  => request('POST', '/auth/signup', { email, name, password }),
  me:        ()                       => request('GET', '/auth/me'),

  getTasks:    ()       => request('GET', '/tasks'),
  createTask:  (data)   => request('POST', '/tasks', data),
  updateTask:  (id, d)  => request('PUT', '/tasks/' + id, d),
  deleteTask:  (id)     => request('DELETE', '/tasks/' + id),

  getHabits:     ()           => request('GET', '/habits'),
  updateHabit:   (id, data)   => request('PUT', '/habits/' + id, data),

  getSettings:    ()       => request('GET', '/settings'),
  updateSettings: (data)   => request('PUT', '/settings', data),
};
