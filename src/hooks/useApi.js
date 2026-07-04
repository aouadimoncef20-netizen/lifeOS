// Try the proxy path first, then direct URL as fallback
const PROXY_URL = '/api';
const DIRECT_URL = 'http://localhost:4000/api';

let _onUnauthorized = null;

export function setUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

function getToken() {
  try { return localStorage.getItem('lifeos-token'); } catch { return null; }
}

// Timeout helper without AbortController (more portable)
function timeoutPromise(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));
}

export async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  // Determine which base URL to use
  const baseURL = localStorage.getItem('lifeos-api-url') || PROXY_URL;

  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);

  let res;
  try {
    // Race the fetch against a timeout
    res = await Promise.race([
      fetch(baseURL + path, opts),
      timeoutPromise(10000),
    ]);
  } catch (err) {
    const msg = err.message === 'Request timed out'
      ? 'Server is not responding. Make sure the backend is running:\n  cd server && npm start'
      : 'Cannot connect to server. ' + err.message;
    throw new Error(msg);
  }

  const contentType = res.headers.get('content-type') || '';

  // If proxy returned HTML, try direct connection
  if (!contentType.includes('application/json')) {
    // Try direct URL as fallback
    if (baseURL === PROXY_URL) {
      try {
        const directRes = await Promise.race([
          fetch(DIRECT_URL + path, opts),
          timeoutPromise(5000),
        ]);
        const directContentType = directRes.headers.get('content-type') || '';
        if (directContentType.includes('application/json')) {
          // Direct worked! Save it for future requests
          localStorage.setItem('lifeos-api-url', DIRECT_URL);
          res = directRes;
        } else {
          await directRes.text().catch(() => {});
          throw new Error('Backend returned non-JSON. Make sure server is running on port 4000.');
        }
      } catch (e2) {
        if (e2.message && e2.message.includes('Backend returned')) throw e2;
        throw new Error(
          'Backend not reachable. Open a terminal and run:\n' +
          '  cd server\n  npm start\n\n' +
          'Then refresh this page.'
        );
      }
    } else {
      await res.text().catch(() => {});
      throw new Error(
        'Server error. Make sure the backend is running:\n  cd server && npm start'
      );
    }
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Server returned invalid data. Try restarting the backend.');
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
