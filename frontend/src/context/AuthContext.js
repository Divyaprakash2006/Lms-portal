import React, { createContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /* ======================
     LOAD USER ON REFRESH
  ====================== */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  /* ======================
     LOGIN (FIXED)
  ====================== */
  const login = async (formData) => {
    try {
      const res = await loginAPI(formData);

      /**
       * EXPECTED BACKEND RESPONSE
       * {
       *   token: "...",
       *   user: { _id, name, email, role }
       * }
       */
      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password',
      };
    }
  };

  /* ======================
     REGISTER
  ====================== */
  const register = async (formData) => {
    try {
      const res = await registerAPI(formData);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  /* ======================
     LOGOUT
  ====================== */
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
