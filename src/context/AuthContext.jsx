import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe, deleteAccount as apiDeleteAccount } from '../api/auth';

const AuthContext = createContext(null);

function persistSession(data) {
  const token    = data.accessToken || data.token;
  const userData = data.user || data;
  localStorage.setItem('kct_token', token);
  localStorage.setItem('kct_user', JSON.stringify(userData));
  return userData;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('kct_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [ready, setReady]     = useState(false);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('kct_token');
    if (!token) { setReady(true); return; }
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('kct_token');
        localStorage.removeItem('kct_user');
      })
      .finally(() => setReady(true));
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const data     = await apiLogin(email, password);
      const userData = persistSession(data);
      setUser(userData);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);
    try {
      const data     = await apiRegister({ name, email, password });
      const userData = persistSession(data);
      setUser(userData);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('kct_token');
    localStorage.removeItem('kct_user');
    setUser(null);
  }

  async function deleteAccount() {
    try {
      await apiDeleteAccount();
    } catch (_) { /* ignore — proceed with local cleanup regardless */ }
    localStorage.removeItem('kct_token');
    localStorage.removeItem('kct_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, deleteAccount, loading, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
