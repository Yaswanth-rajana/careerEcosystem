'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { ShieldAlert } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, isLoading, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">
            AUTHENTICATING ACCESS...
          </span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-display">Access Denied</h2>
          <p className="text-xs text-slate-500">
            You must be logged in as an authorized administrator to view this portal.
          </p>
          <button
            onClick={() => logout()}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Sign In with Administrator Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-900 flex flex-col font-sans">
      {/* Left Sidebar preserved */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Navbar with Quick Actions */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={title}
          subtitle={subtitle}
          actions={actions}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {(title || subtitle || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
