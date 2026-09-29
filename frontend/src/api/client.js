const API_URL = '/api/v1';

let isRefreshing = false;

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 401 && !isRefreshing && !path.includes('/auth/')) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        isRefreshing = false;
        // Retry original request once
        const retry = await fetch(url, config);
        if (!retry.ok) {
          const err = await retry.json().catch(() => ({ error: { message: 'Request failed' } }));
          throw new Error(err.error?.message || 'Request failed');
        }
        return retry.json();
      }
    } catch {
      // refresh failed
    }
    isRefreshing = false;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(err.error?.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export default api;
