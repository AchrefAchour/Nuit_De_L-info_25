import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = await authApi.getMe();
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);
      console.log('[AUTH] Login response:', data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('[AUTH] Token stored in localStorage');
      } else {
        console.error('[AUTH] No token in login response!');
      }
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const data = await authApi.register(name, email, password, role);
      console.log('[AUTH] Register response:', data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('[AUTH] Token stored in localStorage');
      } else {
        console.error('[AUTH] No token in register response!');
      }
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || 'Erreur d\'inscription');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await authApi.updateMe(data);
    setUser(updated.user);
    return updated;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


