'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthHeader } from './AuthHeader';
import { AuthShell } from './AuthShell';

interface AuthPageProps {
  initialMode: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sync mode with pathname if navigated directly
  useEffect(() => {
    if (pathname.includes('/register')) {
      setMode('signup');
    } else if (pathname.includes('/login')) {
      setMode('signin');
    }
  }, [pathname]);

  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    const targetUrl = newMode === 'signin' ? '/login' : '/register';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F19] text-[#F9FAFB] font-sans antialiased selection:bg-[#6366F1]/30 selection:text-white">
      {/* Minimal Header */}
      <AuthHeader />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex items-center justify-center">
        <AuthShell mode={mode} onSwitchMode={handleSwitchMode} />
      </main>

      {/* Minimal Footer Notice */}
      <footer className="w-full py-6 text-center text-xs text-[#94A3B8]/60 border-t border-[#94A3B8]/10">
        © {new Date().getFullYear()} PATHWAY.ECO. All rights reserved.
      </footer>
    </div>
  );
};
