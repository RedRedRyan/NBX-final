"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'investor' | 'company' | 'auditor';

export type User = {
  id?: string;
  email: string;
  useremail: string;
  role: UserRole;
  hederaAccountId?: string;
  hederaEVMAccount?: string;
  companyId?: string;
  companyName?: string;
  accountType?: UserRole;
};

type RawUser = Partial<User> & {
  email?: string;
  useremail?: string;
  role?: UserRole;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole, accountId: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const normalizeUser = (userData: RawUser | null | undefined): User | null => {
  if (!userData) {
    return null;
  }

  const email = userData.email ?? userData.useremail ?? '';
  const useremail = userData.useremail ?? email;

  return {
    ...userData,
    email,
    useremail,
    role: userData.role ?? 'investor',
  } as User;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedToken = localStorage.getItem('nbx_token');
    const storedUser = localStorage.getItem('nbx_user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as RawUser;
        const normalizedUser = normalizeUser(parsedUser);

        if (normalizedUser) {
          setToken(storedToken);
          setUser(normalizedUser);
          // Ensure stored user stays normalized for future loads
          localStorage.setItem('nbx_user', JSON.stringify(normalizedUser));
        } else {
          localStorage.removeItem('nbx_user');
        }
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('nbx_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useremail: email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { access_token, accessToken, user: userData } = data;
      const tokenValue = accessToken ?? access_token;
      const normalizedUser = normalizeUser(userData);

      if (!tokenValue || !normalizedUser) {
        throw new Error('Invalid login response from server');
      }

      // Store token and user data
      localStorage.setItem('nbx_token', tokenValue);
      localStorage.setItem('nbx_user', JSON.stringify(normalizedUser));

      setToken(tokenValue);
      setUser(normalizedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole, accountId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useremail: email,
          password,
          role,
          accountId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      const { access_token, accessToken, user: userData } = data;
      const tokenValue = accessToken ?? access_token;
      const normalizedUser = normalizeUser(userData);

      if (!tokenValue || !normalizedUser) {
        throw new Error('Invalid signup response from server');
      }

      // Store token and user data
      localStorage.setItem('nbx_token', tokenValue);
      localStorage.setItem('nbx_user', JSON.stringify(normalizedUser));

      setToken(tokenValue);
      setUser(normalizedUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nbx_token');
    localStorage.removeItem('nbx_user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
