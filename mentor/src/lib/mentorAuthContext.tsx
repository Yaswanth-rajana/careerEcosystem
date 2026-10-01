'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface MentorUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

export interface MentorRecord {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  status: string;
  domain: string;
  headline: string;
  avatar?: string | null;
}

interface MentorAuthContextType {
  user: MentorUser | null;
  mentor: MentorRecord | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const MentorAuthContext = createContext<MentorAuthContextType>({
  user: null,
  mentor: null,
  isLoading: true,
  logout: async () => {},
  refreshAuth: async () => {},
});

export const useMentorAuth = () => useContext(MentorAuthContext);

export function MentorAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MentorUser | null>(null);
  const [mentor, setMentor] = useState<MentorRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/mentor/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMentor(data.mentor);
      } else {
        setUser(null);
        setMentor(null);
      }
    } catch {
      setUser(null);
      setMentor(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/mentor/auth/logout', { method: 'POST' });
      setUser(null);
      setMentor(null);
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <MentorAuthContext.Provider
      value={{
        user,
        mentor,
        isLoading,
        logout,
        refreshAuth: fetchSession,
      }}
    >
      {children}
    </MentorAuthContext.Provider>
  );
}
