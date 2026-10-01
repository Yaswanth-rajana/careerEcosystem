'use client';

import React, { useState, useEffect } from 'react';
import { Menu, LogOut, ExternalLink, Calendar, Briefcase } from 'lucide-react';
import { useMentorAuth } from '@/lib/mentorAuthContext';
import Link from 'next/link';

export function MentorHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { mentor, user, logout } = useMentorAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const mentorName = mounted ? (mentor?.name || user?.name || 'Mentor') : 'Mentor';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            <span suppressHydrationWarning>{greeting}</span>,{' '}
            <span className="text-blue-600" suppressHydrationWarning>{mentorName}</span>
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {mentor?.headline || 'Operational Mentorship Workspace'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick action buttons */}
        <Link
          href="/availability"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          Availability
        </Link>

        <Link
          href="/mentorship/services"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
        >
          <Briefcase className="w-3.5 h-3.5" />
          Manage Services
        </Link>

        {/* User avatar menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs border border-blue-200">
              {mentorName.charAt(0).toUpperCase()}
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">{mentorName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{mentor?.email || user?.email}</p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit Profile
                </Link>

                <a
                  href={`http://localhost:3000/mentors/${mentor?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Public Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
