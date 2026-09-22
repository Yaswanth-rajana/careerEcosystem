'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export const AuthHeader: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 sm:px-12 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <Link
        href="/"
        className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded-xl px-1 py-0.5"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
          <Compass className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-[#0F172A] flex items-center gap-0.5">
            PATHWAY<span className="text-[#6366F1] font-normal">.ECO</span>
          </span>
        </div>
      </Link>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 border border-slate-200/60"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to home</span>
      </Link>
    </header>
  );
};
