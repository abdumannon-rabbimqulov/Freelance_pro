import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';

interface User {
  user_id?: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  photo?: string;
  is_staff?: boolean;
  auth_role?: string;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (access: string, refresh: string, userData?: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

import api from '../api/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const refreshUser = async () => {
    const access = localStorage.getItem('access');
    if (access) {
      try {
        const res = await api.get('users/me/');
        localStorage.setItem('user_data', JSON.stringify(res.data));
        setUser(res.data);
      } catch (err) {
        console.error("User ma'lumotlarini yangilashda xatolik:", err);
      }
    }
  };

  useEffect(() => {
    // Sahifa yuklanganda localstoragedan tokenni olib foydalanuvchini tiklaymiz
    const access = localStorage.getItem('access');
    if (access) {
      try {
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // Re-fetch to ensure the balance is fresh
          refreshUser();
        } else {
          const decoded = jwtDecode<User>(access);
          setUser(decoded);
          refreshUser();
        }
        setToken(access);
      } catch (e) {
        console.error("Tokenni ochishda xatolik:", e);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const login = (access: string, refresh: string, userData?: any) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } else {
      const decoded = jwtDecode<User>(access);
      setUser(decoded);
    }
    setToken(access);
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user_data');
    setUser(null);
    setToken(null);
    // Logout bo'lganda WebSocket ni ham avtomat uzish uchn sahifani yangilash eng oson yo'l 
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
