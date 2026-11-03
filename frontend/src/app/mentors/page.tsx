'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MentorHero } from '@/components/mentors/MentorHero';
import { RecommendedMentors } from '@/components/mentors/RecommendedMentors';
import { MentorshipNeeds } from '@/components/mentors/MentorshipNeeds';
import { MentorSearch } from '@/components/mentors/MentorSearch';
import { MentorFilters } from '@/components/mentors/MentorFilters';
import { MentorCard } from '@/components/mentors/MentorCard';
import { MentorGridSkeleton } from '@/components/mentors/MentorSkeleton';
import { MentorEmptyState } from '@/components/mentors/MentorEmptyState';
import { HowMentorshipWorks } from '@/components/mentors/HowMentorshipWorks';
import { MyMentorship } from '@/components/mentors/MyMentorship';
import { BecomeMentor } from '@/components/mentors/BecomeMentor';
import { BookingModal } from '@/components/mentors/BookingModal';

import {
  Mentor,
  MentorFilterParams,
  MentorPaginatedResult,
  MentorSessionType,
} from '@/lib/mentors/mentor-types';
import { getMentors } from '@/lib/mentors/mentor-repository';
import { Button } from '@/components/design-system/Button';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function MentorsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState<MentorFilterParams>({
    preference: undefined,
    search: '',
    expertise: [],
    experience: [],
    sessionTypes: [],
    priceRange: 'Any',
    availability: 'All',
    sort: 'recommended',
    page: 1,
    limit: 6,
  });

  const [data, setData] = useState<MentorPaginatedResult>({
    mentors: [],
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
    hasMore: false,
    selectedPreference: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedBookingMentor, setSelectedBookingMentor] = useState<Mentor | null>(null);
  const [selectedBookingServiceId, setSelectedBookingServiceId] = useState<string | undefined>(undefined);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchMentorsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMentors(filters);
      setData(res);
    } catch {
      setData({ mentors: [], total: 0, page: 1, limit: 6, totalPages: 1, hasMore: false });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMentorsData();
  }, [fetchMentorsData]);

  const handleFilterChange = (newFilters: Partial<MentorFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      preference: undefined,
      search: '',
      expertise: [],
      experience: [],
      sessionTypes: [],
      priceRange: 'Any',
      availability: 'All',
      sort: 'recommended',
      page: 1,
      limit: 6,
    });
  };

  const handleSelectNeed = (preference: string, sessionType: MentorSessionType) => {
    setFilters((prev) => ({
      ...prev,
      preference,
      sessionTypes: [sessionType],
      page: 1,
    }));

    // If authenticated, persist candidate preference to backend in background
    if (user) {
      fetch('/api/mentors/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference }),
      }).catch(() => {});
    }
  };

  const handleClearPreference = () => {
    setFilters((prev) => ({
      ...prev,
      preference: undefined,
      sessionTypes: [],
      page: 1,
    }));
  };

  const handleOpenBooking = (mentor: Mentor, serviceId?: string) => {
    if (!user) {
      router.push('/login?from=/mentors');
      return;
    }
    setSelectedBookingMentor(mentor);
    setSelectedBookingServiceId(serviceId || mentor.matchingService?.id || mentor.sessionOptions?.[0]?.id);
    setIsBookingOpen(true);
  };

  const getPreferenceDisplayName = () => {
    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      return filters.sessionTypes[0];
    }
    if (filters.preference) {
      return filters.preference
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return '';
  };

  const activePreferenceLabel = getPreferenceDisplayName();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFAFC] text-slate-900 font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 w-full">
        {/* 1. Split Hero Section */}
        <MentorHero />

        {/* 2. Personalized Recommendation Section */}
        <RecommendedMentors onBookSession={handleOpenBooking} />

        {/* 3. Challenge Needs Section ("What do you need help with?") */}
        <MentorshipNeeds
          onSelectNeed={handleSelectNeed}
          selectedPreference={filters.preference}
        />

        {/* 4. Primary Discovery Area */}
        <section id="mentor-discovery" className="py-16 bg-slate-50/70 scroll-mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Discovery Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                    Find your mentor
                  </h2>
                  {filters.preference && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100/80 rounded-full border border-blue-200 shadow-2xs animate-in fade-in duration-200">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Matching for: {activePreferenceLabel}
                      <button
                        onClick={handleClearPreference}
                        className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition"
                        title="Clear preference"
                      >
                        <X className="w-3 h-3 text-blue-700" />
                      </button>
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {filters.preference
                    ? `Showing verified mentors with active "${activePreferenceLabel}" mentorship services.`
                    : 'Search by expertise, career goal, domain, or select a guidance need above.'}
                </p>
              </div>
            </div>

            {/* Search & Filter Controls Bar */}
            <div className="flex items-center gap-3 mb-8">
              <MentorSearch
                searchQuery={filters.search || ''}
                onSearchChange={(q) => handleFilterChange({ search: q })}
              />
              <MentorFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Main Grid Content (Full Width) */}
            <div className="w-full space-y-8">
              {isLoading ? (
                <MentorGridSkeleton count={6} />
              ) : data.mentors.length === 0 ? (
                <MentorEmptyState
                  onClearFilters={handleResetFilters}
                  title={
                    filters.preference
                      ? `No mentors are currently offering ${activePreferenceLabel} sessions.`
                      : 'No mentors match your criteria'
                  }
                  description={
                    filters.preference
                      ? 'Try another mentorship area or check back soon.'
                      : 'Try adjusting your search query or removing active filters to discover available mentors.'
                  }
                />
              ) : (
                <>
                  {/* Active Mentors Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.mentors.map((mentor) => (
                      <MentorCard
                        key={mentor.id}
                        mentor={mentor}
                        onBookSession={handleOpenBooking}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {data.totalPages > 1 && (
                    <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">
                        Showing page <strong className="text-slate-900">{data.page}</strong> of{' '}
                        <strong className="text-slate-900">{data.totalPages}</strong> ({data.total}{' '}
                        mentors)
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={data.page <= 1}
                          onClick={() => handleFilterChange({ page: data.page - 1 })}
                          leftIcon={<ChevronLeft className="w-4 h-4" />}
                          className="border-slate-200"
                        >
                          Previous
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!data.hasMore}
                          onClick={() => handleFilterChange({ page: data.page + 1 })}
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                          className="border-slate-200"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* 5. How Mentorship Works */}
        <HowMentorshipWorks />

        {/* 6. My Mentorship Activity Section */}
        <MyMentorship />

        {/* 7. Become a Mentor Callout */}
        <BecomeMentor />
      </main>

      {/* Global Booking Workflow Modal */}
      <BookingModal
        mentor={selectedBookingMentor}
        preSelectedOptionId={selectedBookingServiceId}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <Footer />
    </div>
  );
}
