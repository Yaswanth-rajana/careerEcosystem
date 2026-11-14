'use client';

import React, { useState } from 'react';
import { CareerDiscoveryHero } from '@/components/career/CareerDiscoveryHero';
import { CareerCard } from '@/components/career/CareerCard';
import { NotSureSection } from '@/components/career/NotSureSection';
import { DiscoveryEndSection } from '@/components/career/DiscoveryEndSection';
import { getExploreCareerDirections } from '@/lib/careers/career-repository';
import { CandidateCareerContext } from '@/lib/careers/career-types';

export interface ExploreClientPageProps {
  candidate: CandidateCareerContext | null;
  initialSearch?: string;
}

export const ExploreClientPage: React.FC<ExploreClientPageProps> = ({
  candidate,
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  const careers = getExploreCareerDirections(searchQuery);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* 01. Discovery Hero & Live Search across 10 Career Opportunities */}
      <CareerDiscoveryHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCareersCount={careers.length}
      />

      {/* 02. Responsive 10-Career Cards Grid (3 + 3 + 3 + 1 on desktop) */}
      {careers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {careers.map((career) => (
            <CareerCard key={career.id} career={career} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900">No career paths found</h3>
          <p className="text-xs text-slate-500">
            No career roles match your search &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-blue-600 hover:underline pt-2"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* 03. Not Sure? Banner */}
      <NotSureSection />

      {/* 04. Discovery End Section */}
      <DiscoveryEndSection onScrollToTop={handleScrollToTop} />
    </div>
  );
};
