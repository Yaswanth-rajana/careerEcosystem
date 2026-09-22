'use client';

import React, { useState } from 'react';
import { CareerDiscoveryHero } from '@/components/career/CareerDiscoveryHero';
import { CareerCategorySelector } from '@/components/career/CareerCategorySelector';
import { CareerCard } from '@/components/career/CareerCard';
import { NotSureSection } from '@/components/career/NotSureSection';
import { DiscoveryEndSection } from '@/components/career/DiscoveryEndSection';
import { getCareerPaths } from '@/lib/careers/career-repository';
import { CandidateCareerContext } from '@/lib/careers/career-types';

export interface ExploreClientPageProps {
  candidate: CandidateCareerContext | null;
}

export const ExploreClientPage: React.FC<ExploreClientPageProps> = ({ candidate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const careers = getCareerPaths(selectedCategory, searchQuery);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* 01. Discovery Hero & Live Search */}
      <CareerDiscoveryHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCareersCount={careers.length}
      />

      {/* 02. Career Directions / Category Selectors */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
          Explore by career direction
        </h2>
        <CareerCategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* 03. Career Cards Grid */}
      {careers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {careers.map((career) => (
            <CareerCard key={career.id} career={career} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
          <h3 className="text-lg font-bold text-slate-900">No career paths found</h3>
          <p className="text-xs text-slate-500">
            No career roles match your selected category &ldquo;{selectedCategory}&rdquo; and query &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#6366F1] hover:underline pt-2"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 04. Not Sure? Banner */}
      <NotSureSection />

      {/* 05. Discovery End Section */}
      <DiscoveryEndSection onScrollToTop={handleScrollToTop} />
    </div>
  );
};
