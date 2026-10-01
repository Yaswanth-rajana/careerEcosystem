'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  Star,
  DollarSign,
  User,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useMentorAuth } from '@/lib/mentorAuthContext';
import { StatusBadge } from './StatusBadge';

export function MentorSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { mentor } = useMentorAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/mentorship/bookings', icon: Calendar },
    { label: 'Services', href: '/mentorship/services', icon: Briefcase },
    { label: 'Availability', href: '/availability', icon: Clock },
    { label: 'Students', href: '/students', icon: Users },
    { label: 'Reviews', href: '/reviews', icon: Star },
    { label: 'Earnings', href: '/earnings', icon: DollarSign },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/30">
              P
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                PATHWAY<span className="text-blue-600">.ECO</span>
              </span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block -mt-0.5">
                Mentor Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Mentor Status Pill */}
        {mentor && (
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Status</span>
              <StatusBadge status={mentor.status} size="sm" />
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info card */}
        <div className="p-4 border-t border-slate-100 m-3 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100/60">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-800">Operational Hub</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal mb-2.5">
            Manage your schedule, guide aspiring talents, and share feedback.
          </p>
          <a
            href="http://localhost:3000/mentors"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Candidate View <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
}
