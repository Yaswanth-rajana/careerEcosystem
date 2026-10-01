'use client';

import React, { useState } from 'react';
import { MentorSidebar } from './MentorSidebar';
import { MentorHeader } from './MentorHeader';
import { useMentorAuth } from '@/lib/mentorAuthContext';
import { AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export function MentorShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mentor, isLoading } = useMentorAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <MentorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <MentorHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Global status banner if mentor is not APPROVED */}
        {!isLoading && mentor && mentor.status !== 'APPROVED' && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              {mentor.status === 'PENDING' || mentor.status === 'UNDER_REVIEW' ? (
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <div className="text-xs text-amber-900 leading-tight">
                <span className="font-semibold">Application Status: {mentor.status}.</span>{' '}
                {mentor.status === 'PENDING' || mentor.status === 'UNDER_REVIEW'
                  ? 'Your profile is awaiting administrator verification. Once approved, candidates will be able to book your active services.'
                  : mentor.status === 'SUSPENDED'
                  ? 'Your mentor privileges are temporarily suspended. Contact support.'
                  : 'Your application was rejected. Please review feedback.'}
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
