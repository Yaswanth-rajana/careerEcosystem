import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export const Footer = () => {
  const exploreLinks = [
    { label: 'Career Discovery', href: '#beat-02-possibilities' },
    { label: 'Courses', href: '#beat-04-learning' },
    { label: 'Mentorship', href: '#beat-05-guidance' },
    { label: 'Jobs', href: '#beat-07-opportunity' },
    { label: 'Career Guidance', href: '#beat-10-ecosystem' },
  ];

  const journeyLinks = [
    { label: 'The Question', href: '#beat-01-hero' },
    { label: 'The Possibilities', href: '#beat-02-possibilities' },
    { label: 'The Direction', href: '#beat-03-direction' },
    { label: 'The Learning', href: '#beat-04-learning' },
    { label: 'The Guidance', href: '#beat-05-guidance' },
    { label: 'The Preparation', href: '#beat-06-preparation' },
    { label: 'The Opportunity', href: '#beat-07-opportunity' },
    { label: 'The Match', href: '#beat-08-match' },
    { label: 'The Growth', href: '#beat-09-growth' },
    { label: 'The Ecosystem', href: '#beat-10-ecosystem' },
  ];

  return (
    <footer className="border-t border-slate-200/80 dark:border-obsidian-800 bg-slate-50 dark:bg-obsidian-900 text-slate-600 dark:text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                PATHWAY<span className="text-brand-indigo font-normal">.ECO</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
              The unified career platform helping students, graduates, and professionals discover, prepare, and thrive in their dream careers.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-display">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-xs">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-brand-indigo dark:hover:text-brand-indigo-light transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* YOUR JOURNEY */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-display">
              YOUR JOURNEY
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              {journeyLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-brand-indigo dark:hover:text-brand-indigo-light transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ACCOUNT */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-display">
              ACCOUNT
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-brand-indigo dark:hover:text-brand-indigo-light transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-indigo dark:hover:text-brand-indigo-light transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 font-display">
              LEGAL
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-brand-indigo cursor-pointer transition-colors">Privacy</span>
              </li>
              <li>
                <span className="hover:text-brand-indigo cursor-pointer transition-colors">Terms</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-obsidian-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PATHWAY.ECO. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

