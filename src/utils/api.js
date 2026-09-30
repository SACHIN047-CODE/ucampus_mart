const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').trim().replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

/**
 * Universal fetch wrapper for CampusMart REST API
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const config = {
    ...options,
    credentials: 'include', // transmits and accepts HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  // If body is FormData, do not set Content-Type header manually (browser sets boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Unable to connect to backend server (${API_BASE_URL}). Please verify your network or try again.`);
    }
    throw err;
  }
}

/**
 * Auth API methods
 */
export async function apiLogin(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGoogleAuth(credential) {
  return apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export async function apiRegister(userData) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function apiVerifyEmail(email, code) {
  return apiFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function apiLogout() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

export async function apiGetMe() {
  return apiFetch('/auth/me');
}
