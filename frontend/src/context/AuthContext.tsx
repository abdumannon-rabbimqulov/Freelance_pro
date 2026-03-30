import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';

interface User {
  user_id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (access: string, refresh: string) => void;
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
        const decoded = jwtDecode<User>(access);
        setUser(decoded);
        setToken(access);
      } catch (e) {
        console.error("Tokenni ochishda xatolik:", e);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      }
    }
  }, []);

  const login = (access: string, refresh: string) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    const decoded = jwtDecode<User>(access);
    setUser(decoded);
    setToken(access);
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
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
