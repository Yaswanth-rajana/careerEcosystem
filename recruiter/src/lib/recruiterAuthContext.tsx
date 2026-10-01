'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedRecruiter } from '@backend/types/recruiter';

interface RecruiterAuthContextType {
  recruiterData: AuthenticatedRecruiter | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const RecruiterAuthContext = createContext<RecruiterAuthContextType>({
  recruiterData: null,
  isLoading: true,
  loading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshAuth: async () => {},
});

export const RecruiterAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recruiterData, setRecruiterData] = useState<AuthenticatedRecruiter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentRecruiter = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/recruiter/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.recruiter) {
          setRecruiterData(json.recruiter);
        } else if (json.user && json.company) {
          setRecruiterData(json);
        } else {
          setRecruiterData(null);
        }
      } else {
        setRecruiterData(null);
      }
    } catch {
      setRecruiterData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRecruiter();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/recruiter/auth/logout', { method: 'POST' });
    } catch {}
    setRecruiterData(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <RecruiterAuthContext.Provider
      value={{
        recruiterData,
        isLoading,
        loading: isLoading,
        isAuthenticated: !!recruiterData,
        logout,
        refreshAuth: fetchCurrentRecruiter,
      }}
    >
      {children}
    </RecruiterAuthContext.Provider>
  );
};

export const useRecruiterAuth = () => useContext(RecruiterAuthContext);
