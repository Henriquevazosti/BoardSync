const DEFAULT_DEV_API_URL = 'http://localhost:3001/api/v1';
const DEFAULT_PROD_API_URL = 'https://boardsync.onrender.com/api/v1';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL);

export function buildApiUrl(endpoint = '') {
  return `${API_BASE_URL}${endpoint}`;
}
