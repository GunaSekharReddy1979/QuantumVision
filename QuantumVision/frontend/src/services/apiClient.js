/**
 * QuantumVision Centralized API Client.
 * Connects to the FastAPI backend using relative proxy (/api) by default,
 * with automatic fallback to http://127.0.0.1:8000/api to prevent
 * IPv4/IPv6 localhost mismatch and CORS connection failures.
 */
const configuredUrl = import.meta.env.VITE_API_BASE_URL;
const PRIMARY_BASE_URL = configuredUrl 
  ? (configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`)
  : '/api';
const FALLBACK_BASE_URL = 'http://127.0.0.1:8000/api';

async function requestWithUrl(baseUrl, cleanEndpoint, options) {
  const url = `${baseUrl}${cleanEndpoint}`;
  const hasBody = options.body !== undefined && options.body !== null;
  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.detail || `HTTP ${response.status}: ${response.statusText}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    return await requestWithUrl(PRIMARY_BASE_URL, cleanEndpoint, options);
  } catch (primaryError) {
    // If primary relative request failed due to network / fetch error and fallback is different, try fallback
    if (PRIMARY_BASE_URL !== FALLBACK_BASE_URL && (primaryError.name === 'TypeError' || primaryError.message.includes('fetch'))) {
      try {
        return await requestWithUrl(FALLBACK_BASE_URL, cleanEndpoint, options);
      } catch (fallbackError) {
        console.warn(`[API Network Error] ${options.method || 'GET'} ${cleanEndpoint} failed on both endpoints:`, fallbackError.message);
        throw fallbackError;
      }
    }
    throw primaryError;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body = {}, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (endpoint, body = {}, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export { request };
export default api;
