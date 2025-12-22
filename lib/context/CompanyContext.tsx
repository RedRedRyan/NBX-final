"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/lib/api/client';
import { useAuth } from './AuthContext';

interface CompanyDocument {
  _id: string;
  name: string;
  type: string;
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface Company {
  _id: string;
  name: string;
  symbol: string;
  ticker: string;
  sector: string;
  description: string;
  totalSupply: string;
  circulatingSupply: string;
  marketCap: string;
  price: number;
  useremail: string;
  documents: CompanyDocument[];
  highlights: string[];
  team: any[];
  priceHistory: any[];
  isTokenized: boolean;
  tokenId?: string;
  treasuryAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  fetchUserCompanies: () => Promise<void>;
  fetchCompanyById: (id: string) => Promise<void>;
  setCurrentCompany: (company: Company | null) => void;
  refreshCompany: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all companies for the current user
  const fetchUserCompanies = async () => {
    if (!user || !token || user.role !== 'company') return;

    try {
      setIsLoading(true);
      setError(null);
      const response: any = await ApiClient.getUserCompanies(user.useremail, token);
      setCompanies(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a specific company by ID
  const fetchCompanyById = async (id: string) => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const response: any = await ApiClient.getCompany(id, token);
      const company = response.data || response;
      setCurrentCompany(company);
      
      // Update in companies list if exists
      setCompanies(prev => {
        const index = prev.findIndex(c => c._id === id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = company;
          return updated;
        }
        return [...prev, company];
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company');
      console.error('Error fetching company:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh a specific company
  const refreshCompany = async (id: string) => {
    await fetchCompanyById(id);
  };

  // Auto-fetch user companies when user logs in
  useEffect(() => {
    if (user && token && user.role === 'company') {
      fetchUserCompanies();
    } else {
      setCompanies([]);
      setCurrentCompany(null);
    }
  }, [user, token]);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        isLoading,
        error,
        fetchUserCompanies,
        fetchCompanyById,
        setCurrentCompany,
        refreshCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};