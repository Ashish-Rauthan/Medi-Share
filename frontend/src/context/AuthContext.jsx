import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ms_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ms_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('ms_token');
          localStorage.removeItem('ms_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('ms_token', res.data.token);
    localStorage.setItem('ms_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  /**
   * Register never returns a token directly — the backend always sends an OTP
   * first. The calling page must navigate to /verify-otp with userId + role.
   * Storing a token here would be incorrect and a security issue.
   */
  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    // res.data = { message, userId, role } — no token yet
    return res.data;
  }, []);

  /**
   * Called after OTP verification succeeds for a donor.
   * The VerifyOtp page receives the token and calls this to hydrate auth state.
   */
  const finalizeLogin = useCallback((token, userData) => {
    localStorage.setItem('ms_token', token);
    localStorage.setItem('ms_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, finalizeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
