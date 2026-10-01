'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JobCardDTO, PaginatedResult } from '@backend/types/jobs';
import { JobsApiClient } from '@/services/jobsClient';
import { JobCard } from '@/components/jobs/JobCard';
import { JobListSkeleton } from '@/components/jobs/JobListSkeleton';
import { JobEmptyState } from '@/components/jobs/JobEmptyState';
import { JobFilters, FilterState } from '@/components/jobs/JobFilters';
import { JobSearchBar } from '@/components/jobs/JobSearchBar';
import { JobSort } from '@/components/jobs/JobSort';
import { JobsNavTabs, JobTabType } from '@/components/jobs/JobsNavTabs';
import { RecommendedJobs } from '@/components/jobs/RecommendedJobs';
import { JobPagination } from '@/components/jobs/JobPagination';
import { SavedJobsView } from '@/components/jobs/SavedJobsView';
import { ApplicationsView } from '@/components/jobs/ApplicationsView';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { useAuth } from '@/lib/AuthContext';

function JobsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Read URL query parameters
  const initialTab = (searchParams.get('tab') as JobTabType) || 'all';
  const initialQ = searchParams.get('q') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialSort = (searchParams.get('sort') as 'newest' | 'relevance') || 'newest';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialPostedWithin = searchParams.get('postedWithin') || undefined;

  const initialWorkMode = searchParams.get('workMode')
    ? searchParams.get('workMode')!.split(',').filter(Boolean)
    : [];
  const initialEmploymentType = searchParams.get('employmentType')
    ? searchParams.get('employmentType')!.split(',').filter(Boolean)
    : [];
  const initialExperienceLevel = searchParams.get('experienceLevel')
    ? searchParams.get('experienceLevel')!.split(',').filter(Boolean)
    : [];

  const [activeTab, setActiveTab] = useState<JobTabType>(initialTab);
  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);
  const [sort, setSort] = useState<'newest' | 'relevance'>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<FilterState>({
    workMode: initialWorkMode,
    employmentType: initialEmploymentType,
    experienceLevel: initialExperienceLevel,
    postedWithin: initialPostedWithin,
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data states
  const [searchData, setSearchData] = useState<PaginatedResult<JobCardDTO> | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [recommendedJobs, setRecommendedJobs] = useState<JobCardDTO[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const [savedCount, setSavedCount] = useState<number | undefined>(undefined);
  const [appCount, setAppCount] = useState<number | undefined>(undefined);

  // AbortController ref for cancelling stale search requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state to URL
  const updateUrl = useCallback(
    (
      newTab: JobTabType,
      newQ: string,
      newLoc: string,
      newFilters: FilterState,
      newSort: 'newest' | 'relevance',
      newPage: number
    ) => {
      const params = new URLSearchParams();
      if (newTab !== 'all') params.set('tab', newTab);
      if (newQ) params.set('q', newQ);
      if (newLoc) params.set('location', newLoc);
      if (newSort !== 'newest') params.set('sort', newSort);
      if (newPage > 1) params.set('page', newPage.toString());

      if (newFilters.workMode.length > 0) {
        params.set('workMode', newFilters.workMode.join(','));
      }
      if (newFilters.employmentType.length > 0) {
        params.set('employmentType', newFilters.employmentType.join(','));
      }
      if (newFilters.experienceLevel.length > 0) {
        params.set('experienceLevel', newFilters.experienceLevel.join(','));
      }
      if (newFilters.postedWithin) {
        params.set('postedWithin', newFilters.postedWithin);
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  // Execute server-side search
  const executeSearch = useCallback(async () => {
    // Cancel in-flight search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsSearching(true);
      setSearchError(null);

      const result = await JobsApiClient.searchJobs(
        {
          q: q || undefined,
          location: location || undefined,
          workMode: filters.workMode,
          employmentType: filters.employmentType,
          experienceLevel: filters.experienceLevel,
          postedWithin: filters.postedWithin as any,
          sort,
          page,
          limit: 20,
        },
        controller.signal
      );

      setSearchData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search jobs error:', err);
        setSearchError(err.message || 'Unable to load opportunities right now.');
      }
    } finally {
      setIsSearching(false);
    }
  }, [q, location, filters, sort, page]);

  // Load recommended jobs
  const loadRecommended = useCallback(async () => {
    try {
      setIsRecLoading(true);
      const items = await JobsApiClient.getRecommendedJobs(3);
      setRecommendedJobs(items);
    } catch (err) {
      console.error('Failed to load recommended jobs:', err);
    } finally {
      setIsRecLoading(false);
    }
  }, []);

  // Fetch count badges if authenticated
  useEffect(() => {
    if (user) {
      JobsApiClient.getSavedJobs(1, 1)
        .then((res) => setSavedCount(res.total))
        .catch(() => {});
      JobsApiClient.getApplications(1, 1)
        .then((res) => setAppCount(res.total))
        .catch(() => {});
    }
  }, [user]);

  // Trigger search on filter / query change
  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  // Trigger recommended loading
  useEffect(() => {
    loadRecommended();
  }, [loadRecommended]);

  // Handlers
  const handleTabChange = (tab: JobTabType) => {
    setActiveTab(tab);
    updateUrl(tab, q, location, filters, sort, page);
  };

  const handleSearchSubmit = (newQ: string, newLoc: string) => {
    setQ(newQ);
    setLocation(newLoc);
    setPage(1);
    if (activeTab !== 'all') {
      setActiveTab('all');
      updateUrl('all', newQ, newLoc, filters, sort, 1);
    } else {
      updateUrl(activeTab, newQ, newLoc, filters, sort, 1);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    updateUrl(activeTab, q, location, newFilters, sort, 1);
  };

  const handleClearFilters = () => {
    const cleared: FilterState = {
      workMode: [],
      employmentType: [],
      experienceLevel: [],
      postedWithin: undefined,
    };
    setFilters(cleared);
    setQ('');
    setLocation('');
    setPage(1);
    updateUrl(activeTab, '', '', cleared, sort, 1);
  };

  const handleSortChange = (newSort: 'newest' | 'relevance') => {
    setSort(newSort);
    updateUrl(activeTab, q, location, filters, newSort, page);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(activeTab, q, location, filters, sort, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount =
    filters.workMode.length +
    filters.employmentType.length +
    filters.experienceLevel.length +
    (filters.postedWithin ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC] text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Compact Header & Search UI */}
        <section className="space-y-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
              Jobs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Find opportunities aligned with your skills, experience, and career direction.
            </p>
          </div>

          {/* Search Bar */}
          <JobSearchBar
            initialQuery={q}
            initialLocation={location}
            onSearch={handleSearchSubmit}
          />

          {/* Segmented Navigation Tabs */}
          <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
            <JobsNavTabs
              activeTab={activeTab}
              onChangeTab={handleTabChange}
              savedCount={savedCount}
              applicationCount={appCount}
            />

            {/* Mobile Filter & Sort Triggers */}
            {activeTab === 'all' && (
              <div className="flex lg:hidden items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileFilterOpen(true)}
                  leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />}
                  className="text-xs font-semibold"
                >
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                <JobSort sort={sort} onChange={handleSortChange} />
              </div>
            )}
          </div>
        </section>

        {/* TAB: FOR YOU / RECOMMENDED */}
        {activeTab === 'recommended' && (
          <div className="space-y-8">
            <RecommendedJobs
              jobs={recommendedJobs}
              isLoading={isRecLoading}
              onSavedChange={(jobId, isSaved) => {
                setRecommendedJobs((prev) =>
                  prev.map((j) => (j.id === jobId ? { ...j, isSaved } : j))
                );
              }}
            />

            {/* Quick transition to all jobs */}
            <div className="text-center pt-6 pb-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-3">
                Looking for more opportunities across diverse categories?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTabChange('all')}
                className="font-semibold text-slate-700"
              >
                Browse All Open Positions
              </Button>
            </div>
          </div>
        )}

        {/* TAB: SAVED OPPORTUNITIES */}
        {activeTab === 'saved' && (
          <SavedJobsView onExploreJobs={() => handleTabChange('all')} />
        )}

        {/* TAB: APPLICATIONS */}
        {activeTab === 'applications' && (
          <ApplicationsView onExploreJobs={() => handleTabChange('all')} />
        )}

        {/* TAB: ALL JOBS (Primary Search & Filter Grid) */}
        {activeTab === 'all' && (
          <div className="flex items-start gap-8">
            {/* Desktop Filters Sidebar */}
            <JobFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
              isOpenMobile={mobileFilterOpen}
              onCloseMobile={() => setMobileFilterOpen(false)}
            />

            {/* Results Column */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Results Count & Desktop Sort Bar */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  {isSearching ? (
                    'Searching opportunities...'
                  ) : searchData ? (
                    `${searchData.total} opportunit${searchData.total === 1 ? 'y' : 'ies'} found`
                  ) : (
                    'Opportunities'
                  )}
                </span>
                <div className="hidden lg:block">
                  <JobSort sort={sort} onChange={handleSortChange} />
                </div>
              </div>

              {/* Error State */}
              {searchError && (
                <div className="bg-white border border-red-200 rounded-2xl p-6 text-center shadow-xs">
                  <p className="text-sm font-semibold text-red-600 mb-3">{searchError}</p>
                  <Button variant="outline" size="sm" onClick={executeSearch}>
                    Try Again
                  </Button>
                </div>
              )}

              {/* Loading Skeleton */}
              {isSearching && <JobListSkeleton count={4} />}

              {/* Empty Results State */}
              {!isSearching && (!searchData || searchData.items.length === 0) && (
                <JobEmptyState
                  type={
                    q ||
                    location ||
                    filters.workMode.length > 0 ||
                    filters.employmentType.length > 0 ||
                    filters.experienceLevel.length > 0 ||
                    filters.postedWithin
                      ? 'search'
                      : 'empty'
                  }
                  onClearFilters={handleClearFilters}
                />
              )}

              {/* Job Results List */}
              {!isSearching && searchData && searchData.items.length > 0 && (
                <div className="space-y-3.5">
                  {searchData.items.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSavedChange={(jobId, isSaved) => {
                        setSearchData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            items: prev.items.map((j) =>
                              j.id === jobId ? { ...j, isSaved } : j
                            ),
                          };
                        });
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isSearching && searchData && (
                <JobPagination
                  page={page}
                  totalPages={searchData.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-between">
          <Header />
          <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
            <div className="h-8 bg-slate-200 rounded-md w-48 mb-6 animate-pulse" />
            <JobListSkeleton count={4} />
          </div>
          <Footer />
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
