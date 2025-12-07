"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type UserType = {
  email: string;
  accountType: 'individual' | 'institution' | null;
} | null;

type AuthContextType = {
  user: UserType;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, accountType: 'individual' | 'institution') => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('nbx_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call to authenticate
    // For now, we'll just simulate a successful login
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get stored user if exists (to get the account type)
    const storedUser = localStorage.getItem('nbx_user');
    let accountType: 'individual' | 'institution' | null = null;
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.email === email) {
        accountType = parsedUser.accountType;
      }
    }
    
    const newUser = { 
      email, 
      accountType 
    };
    
    localStorage.setItem('nbx_user', JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, accountType: 'individual' | 'institution') => {
    // In a real app, this would make an API call to register
    // For now, we'll just simulate a successful registration
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = { 
      email, 
      accountType 
    };
    
    localStorage.setItem('nbx_user', JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('nbx_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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