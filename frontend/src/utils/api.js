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
      localStorage.removeItem('ms_token');
      localStorage.removeItem('ms_user');
      toast.error('Your session expired. Please log in again.');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(message);
    } else if (!err.response || status >= 500) {
      toast.error('The server is currently unavailable. Please try again shortly.');
    } else if (message) {
      toast.error(message);
    }

    return Promise.reject(err);
  }
);

export default api;
