'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/adminAuthContext';
import {
  Menu,
  PlusCircle,
  Compass,
  Briefcase,
  Users,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Settings,
  Sparkles,
  Building2,
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const QUICK_ACTIONS = [
  {
    label: 'Create Course',
    href: '/courses/new',
    icon: PlusCircle,
    color: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20',
  },
  {
    label: 'Review Mentors',
    href: '/mentors',
    icon: Compass,
    color: 'bg-blue-500/15 text-blue-600 border border-blue-500/20',
  },
  {
    label: 'Review Employers',
    href: '/employers/applications',
    icon: Building2,
    color: 'bg-purple-500/15 text-purple-600 border border-purple-500/20',
  },
  {
    label: 'Review Jobs',
    href: '/jobs',
    icon: Briefcase,
    color: 'bg-amber-500/15 text-amber-600 border border-amber-500/20',
  },
  {
    label: 'Students Directory',
    href: '/users',
    icon: Users,
    color: 'bg-indigo-500/15 text-indigo-600 border border-indigo-500/20',
  },
  {
    label: 'Audit Trail',
    href: '/audit-logs',
    icon: ShieldCheck,
    color: 'bg-slate-500/15 text-slate-700 border border-slate-500/20',
  },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
}) => {
  const { admin, logout } = useAdminAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-white/60 hover:bg-white/90 backdrop-blur-md lg:hidden border border-white/80 shadow-xs"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Glassmorphic Quick Actions Capsule */}
      <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/45 backdrop-blur-2xl border border-white/70 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white/95 text-slate-700 hover:text-slate-900 border border-white/80 hover:border-slate-200/80 text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 backdrop-blur-md transition-all duration-200 whitespace-nowrap"
            >
              <div className={`w-4.5 h-4.5 rounded-full ${action.color} flex items-center justify-center shrink-0 shadow-xs`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="tracking-tight">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Screen Quick Actions Dropdown */}
      <div className="md:hidden relative" ref={quickMenuRef}>
        <button
          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/80 text-xs font-semibold text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Actions</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${quickMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {quickMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5 p-2 z-50 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Platform Actions
            </div>
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setQuickMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/80 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-lg ${action.color} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Glassmorphic Admin Account Pill Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {admin && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 hover:border-slate-300/80 text-[#0F172A] shadow-[0_4px_16px_0_rgba(15,23,42,0.05)] ring-1 ring-slate-900/5 transition-all duration-200 focus:outline-none"
              aria-expanded={dropdownOpen}
              aria-label="Admin account menu"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-semibold max-w-[110px] truncate hidden sm:inline-block">
                {admin?.name?.split(' ')[0] || 'Admin'}
              </span>
              <span className="hidden md:inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 backdrop-blur-sm uppercase">
                {admin?.role || 'ADMIN'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_32px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 py-2 z-50 text-left">
                <div className="px-4 py-2.5 border-b border-slate-100/80">
                  <p className="text-xs font-bold text-slate-900 truncate">{admin.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{admin.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white/80 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Platform Settings</span>
                  </Link>
                  <Link
                    href="/audit-logs"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white/80 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Audit Trail</span>
                  </Link>
                </div>
                <div className="border-t border-slate-100/80 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50/80 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
