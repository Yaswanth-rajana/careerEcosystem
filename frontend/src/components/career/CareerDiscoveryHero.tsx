'use client';

import React from 'react';
import { Compass, Sparkles, Search } from 'lucide-react';

export interface CareerDiscoveryHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCareersCount: number;
}

export const CareerDiscoveryHero: React.FC<CareerDiscoveryHeroProps> = ({
  searchQuery,
  onSearchChange,
  totalCareersCount,
}) => {
  return (
    <div className="text-center max-w-4xl mx-auto space-y-6 pt-4 pb-8">
      {/* Eyebrow Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>CAREER DIRECTION & DISCOVERY</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-slate-900 leading-[1.1]">
        What could you{' '}
        <span className="text-blue-600">
          become?
        </span>
      </h1>

      {/* Supporting Copy */}
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Your degree doesn&apos;t define your career. Choose a direction and discover what it takes to get there.
      </p>

      {/* Search Input Bar */}
      <div className="max-w-xl mx-auto pt-2">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roles by title, skill, or industry (e.g. Cloud Engineer, Data, Python)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>
        {searchQuery && (
          <p className="text-xs text-slate-500 mt-2 text-left px-2">
            Showing results matching &ldquo;{searchQuery}&rdquo; ({totalCareersCount} role{totalCareersCount !== 1 ? 's' : ''} found)
          </p>
        )}
      </div>
    </div>
  );
};
