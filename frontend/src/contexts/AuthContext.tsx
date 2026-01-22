import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, register, AuthResponse } from '../services/api';
import { CURRENCIES } from './CurrencyContext';

interface User {
  email: string;
  fullName: string;
  baseCurrency?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateBaseCurrency: (baseCurrency: string) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // Invalid saved user data, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const response: AuthResponse = await login({ email, password });

    const userData = { email: response.email, fullName: response.fullName, baseCurrency: response.baseCurrency };
    setUser(userData);

    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleRegister = async (email: string, password: string, fullName: string) => {
    const response: AuthResponse = await register({ email, password, fullName });

    const userData = { email: response.email, fullName: response.fullName, baseCurrency: response.baseCurrency };
    setUser(userData);

    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateBaseCurrency = (baseCurrency: string) => {
    if (user) {
      const updatedUser = { ...user, baseCurrency };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateBaseCurrency,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
