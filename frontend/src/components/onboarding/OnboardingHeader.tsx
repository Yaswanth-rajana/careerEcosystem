'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Loader2, BookmarkCheck } from 'lucide-react';

interface OnboardingHeaderProps {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: Date | null;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ saveStatus, lastSavedAt }) => {
  return (
    <header className="w-full border-b border-[#94A3B8]/10 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-display font-bold text-lg text-[#F9FAFB] tracking-tight">
              PATHWAY<span className="text-[#6366F1]">.ECO</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" /> Candidate Onboarding
          </span>
        </div>

        {/* Right: Progressive Auto-Save Indicator */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#94A3B8]/15 text-[#94A3B8]">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-[#6366F1] animate-spin" />
                <span className="text-[#F9FAFB] font-medium">Saving progress…</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Saved automatically</span>
              </>
            )}
            {saveStatus === 'idle' && (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-[#6366F1]" />
                <span className="hidden md:inline">Progress saved server-side</span>
                <span className="md:hidden">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-400 font-medium">Saving failed. Retrying…</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
