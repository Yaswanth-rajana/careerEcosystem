'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Button } from '@/components/design-system/Button';
import { ThemeToggle } from '@/components/design-system/ThemeToggle';
import { Badge } from '@/components/design-system/Badge';
import { Menu, X, Compass, ArrowRight, User, LogOut, LayoutDashboard, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PillNav, type PillNavItem } from './PillNav';
import { useAuth } from '@/lib/AuthContext';
import { type AuthUser } from '@/lib/auth';
import { getSavedTargetRoles, type SavedRoleItem } from '@/lib/careers/career-repository';

export interface HeaderProps {
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user: initialUser, onLogout }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user: contextUser, isLoading, logout: contextLogout } = useAuth();
  
  const currentUser = initialUser !== undefined ? initialUser : contextUser;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [savedRoles, setSavedRoles] = useState<SavedRoleItem[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const logoImgRef = useRef<HTMLDivElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to target roles changes
  useEffect(() => {
    const updateSavedRoles = () => {
      setSavedRoles(getSavedTargetRoles());
    };

    updateSavedRoles();
    window.addEventListener('pathway_selected_roles_changed', updateSavedRoles);
    window.addEventListener('pathway_selected_role_changed', updateSavedRoles);
    return () => {
      window.removeEventListener('pathway_selected_roles_changed', updateSavedRoles);
      window.removeEventListener('pathway_selected_role_changed', updateSavedRoles);
    };
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      await contextLogout();
      router.push('/');
      router.refresh();
    }
  };

  const handleLogoEnter = () => {
    if (shouldReduceMotion || !logoImgRef.current) return;
    logoTweenRef.current?.kill();
    gsap.set(logoImgRef.current, { rotate: 0 });
    logoTweenRef.current = gsap.to(logoImgRef.current, {
      rotate: 360,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const primaryPathHref = savedRoles.length > 0
    ? `/careers/${savedRoles[savedRoles.length - 1].slug}`
    : '/careers/cloud-engineer';

  const myPathSubItems = savedRoles.map((r) => ({
    label: r.title,
    href: `/careers/${r.slug}`,
    category: r.category,
  }));

  const navItems: PillNavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore' },
    {
      label: 'My Path',
      href: primaryPathHref,
      badge: savedRoles.length > 1 ? `${savedRoles.length}` : undefined,
      subItems: myPathSubItems.length > 0 ? myPathSubItems : undefined,
    },
    { label: 'Learn', href: '/learn' },
    { label: 'Mentors', href: '/mentors' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Tools', href: '/tools' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* PATHWAY.ECO Brand Logo with GSAP 360° Spin Hover */}
        <Link
          href={currentUser ? '/dashboard' : '/'}
          onMouseEnter={handleLogoEnter}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div
            ref={logoImgRef}
            className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200"
          >
            <Compass className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-[#F9FAFB] flex items-center gap-0.5">
              PATHWAY<span className="text-[#6366F1] font-normal">.ECO</span>
            </span>
          </div>
        </Link>

        {/* Desktop GSAP Animated Pill Navigation Bar */}
        <PillNav items={navItems} activeHref={pathname} />

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <div className="opacity-90 hover:opacity-100 transition-opacity">
            <ThemeToggle />
          </div>

          {isLoading && initialUser === undefined ? (
            /* Subtle Loading Skeleton while checking session */
            <div className="w-24 h-9 rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
          ) : currentUser ? (
            /* ACCOUNT ICON & USER DROPDOWN MENU */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-[#6366F1]/60 bg-slate-50 dark:bg-slate-900/90 text-[#0F172A] dark:text-[#F9FAFB] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] shadow-sm"
                aria-expanded={userDropdownOpen}
                aria-label="User account menu"
              >
                {/* Account Circle Icon / Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold max-w-[120px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Account Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-left"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs font-bold text-[#0F172A] dark:text-[#F9FAFB] truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#6366F1]" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#8B5CF6]" />
                        <span>Profile & Settings</span>
                      </Link>
                    </div>

                    {/* Logout Option */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* UNAUTHENTICATED: SIGN IN & GET STARTED BUTTONS */
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#0F172A] dark:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="bg-brand-gradient hover:opacity-95 text-white font-bold shadow-sm"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-[#F9FAFB]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 'auto' }}
            className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-4 py-4 space-y-3"
          >
            <div className="grid gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#0F172A] dark:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-slate-800/70"
                  >
                    <span>{item.label}</span>
                    {item.badge && <Badge variant="neutral" size="sm">{item.badge}</Badge>}
                  </Link>

                  {/* Render Sub-Items on Mobile if present */}
                  {item.subItems && item.subItems.length > 0 && (
                    <div className="pl-6 pr-2 space-y-1 pb-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          <span>• {sub.label}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {isLoading && initialUser === undefined ? (
                <div className="w-full h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
              ) : currentUser ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
                    Signed in as <span className="text-[#0F172A] dark:text-[#F9FAFB] font-bold">{currentUser.name}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" leftIcon={<User className="w-4 h-4" />}>
                      Profile & Settings
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
