'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecruiterSidebar } from './RecruiterSidebar';
import { RecruiterHeader } from './RecruiterHeader';
import { useRecruiterAuth } from '@/lib/recruiterAuthContext';
import { Loader2 } from 'lucide-react';

interface RecruiterShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const RecruiterShell: React.FC<RecruiterShellProps> = ({
  children,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, isAuthenticated } = useRecruiterAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            {loading ? 'Loading Recruiter Workspace...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
      {/* Sidebar navigation */}
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <RecruiterHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
