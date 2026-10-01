'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  Compass,
  Building2,
  FileCheck2,
  ShieldAlert,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/adminAuthContext';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Students & Users',
    href: '/users',
    icon: Users,
  },
  {
    name: 'Courses',
    href: '/courses',
    icon: GraduationCap,
  },
  {
    name: 'Mentors',
    href: '/mentors',
    icon: Compass,
  },
  {
    name: 'Employers',
    href: '/employers/applications',
    icon: Building2,
  },
  {
    name: 'Job Listings',
    href: '/jobs',
    icon: Briefcase,
  },
  {
    name: 'Applications',
    href: '/applications',
    icon: FileCheck2,
  },
  {
    name: 'Audit Logs',
    href: '/audit-logs',
    icon: ShieldAlert,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

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
          {/* Brand Header matching main portal */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Compass className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-base tracking-tight text-[#0F172A] flex items-center gap-0.5">
                  PATHWAY<span className="text-blue-600 font-normal">.ECO</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Control Plane
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations & Management
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {admin?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold tracking-wide">
                  {admin?.role || 'ADMIN'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
