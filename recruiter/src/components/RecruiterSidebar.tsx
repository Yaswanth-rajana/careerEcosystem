'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileCheck2,
  CheckSquare,
  Calendar,
  Award,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useRecruiterAuth } from '@/lib/recruiterAuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Applications', href: '/applications', icon: FileCheck2 },
  { name: 'Assessments', href: '/assessments', icon: CheckSquare },
  { name: 'Interviews', href: '/interviews', icon: Calendar },
  { name: 'Offers & Hires', href: '/offers', icon: Award },
  { name: 'Company Profile', href: '/company', icon: Building2 },
  { name: 'Team Members', href: '/team', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface RecruiterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecruiterSidebar: React.FC<RecruiterSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { recruiterData, logout } = useRecruiterAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-0.5">
                  PATHWAY<span className="text-blue-600 font-normal">.ECO</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Hiring Workspace
                </span>
              </div>
            </Link>
          </div>

          {/* Company Workspace Chip */}
          {recruiterData?.company && (
            <div className="p-3 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                {recruiterData.company.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {recruiterData.company.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {recruiterData.recruiter.designation}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {recruiterData && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {recruiterData.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {recruiterData.user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {recruiterData.user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
