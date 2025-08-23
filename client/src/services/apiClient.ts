import axios from 'axios';
import { navigate } from '../utils/navigate';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      const current = window.location.pathname + window.location.search;
      sessionStorage.setItem('postSignInRedirect', current);
      navigate('/sign-in');
    }
    return Promise.reject(err);
  }
);

export function setAuthHeader(getToken?: ()=>Promise<string | null | undefined>) {
  if (!getToken) return;
  api.interceptors.request.use(async config => {
    if (!config.headers.Authorization) {
      try {
        const token = await getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {}
    }
    return config;
  });
}

export default api;
