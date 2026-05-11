import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api/client.js';

const AuthContext = createContext(null);
const storageKey = 'bim-platform-session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    setAuthToken(session?.token);
    if (session) localStorage.setItem(storageKey, JSON.stringify(session));
    else localStorage.removeItem(storageKey);
  }, [session]);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setSession(data);
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    setSession(data);
  }

  const value = useMemo(
    () => ({
      token: session?.token,
      user: session?.user,
      isAdmin: session?.user?.role === 'ADMIN',
      login,
      register,
      logout: () => setSession(null)
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
