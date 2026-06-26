import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ms_token');
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Something went wrong';

    if (status === 401) {
      // Only clear session and redirect if not already on an auth page
      localStorage.removeItem('ms_token');
      localStorage.removeItem('ms_user');
      const onAuthPage = ['/login', '/register', '/verify-otp'].some(p =>
        window.location.pathname.startsWith(p)
      );
      if (!onAuthPage) {
        toast.error('Your session expired. Please log in again.');
        window.location.href = '/login';
      }
      // Let the calling page handle the error display for auth pages
    } else if (status === 403) {
      // 403s during auth flows (needsVerification, pendingApproval) are handled
      // by the login/register pages themselves — don't show a generic toast here.
      // Only show toast for true permission denials (non-auth routes).
      const isAuthFlow = err.config?.url?.includes('/auth/');
      if (!isAuthFlow) {
        toast.error(message);
      }
    } else if (status === 409) {
      // Conflict errors (duplicate email, duplicate request) are shown by pages
      // Don't double-toast
    } else if (!err.response || status >= 500) {
      toast.error('The server is currently unavailable. Please try again shortly.');
    } else if (status >= 400 && status < 500) {
      // 400-level errors (bad input, not found) — let the calling page decide
      // whether to show inline error or toast. Don't auto-toast here.
    }

    return Promise.reject(err);
  }
);

export default api;
