'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';

export const NotSureSection: React.FC = () => {
  return (
    <div className="my-12 rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
      {/* Background Decorative Element */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
          <Compass className="w-3.5 h-3.5 text-blue-300" />
          <span>CAREER GUIDANCE</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
          Not sure what career fits you?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Tell us what you know, what interests you, and where you want to go. We&apos;ll help you find your career direction.
        </p>

        <div className="pt-2">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all group"
          >
            <span>Find My Career Direction</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
