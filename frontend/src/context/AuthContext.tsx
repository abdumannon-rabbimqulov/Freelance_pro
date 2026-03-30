import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';

interface User {
  user_id?: string;
  username: string;
  email?: string;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (access: string, refresh: string, userData?: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Sahifa yuklanganda localstoragedan tokenni olib foydalanuvchini tiklaymiz
    const access = localStorage.getItem('access');
    if (access) {
      try {
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const decoded = jwtDecode<User>(access);
          setUser(decoded);
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
