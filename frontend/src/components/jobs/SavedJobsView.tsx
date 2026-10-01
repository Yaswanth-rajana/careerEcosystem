import React, { useState, useEffect } from 'react';
import { JobCardDTO, PaginatedResult } from '@backend/types/jobs';
import { JobsApiClient } from '@/services/jobsClient';
import { JobCard } from './JobCard';
import { JobEmptyState } from './JobEmptyState';
import { JobListSkeleton } from './JobListSkeleton';
import { JobPagination } from './JobPagination';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/design-system/Button';

interface Props {
  onExploreJobs?: () => void;
}

export const SavedJobsView: React.FC<Props> = ({ onExploreJobs }) => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<PaginatedResult<JobCardDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSavedJobs = async (targetPage: number) => {
    try {
      setIsLoading(true);
      const res = await JobsApiClient.getSavedJobs(targetPage, 20);
      setData(res);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        fetchSavedJobs(page);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading, page]);

  if (!isAuthLoading && !user) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Sign in to view saved opportunities</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
          Bookmark jobs to review, prepare, and apply whenever you are ready.
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/login?redirect=/jobs?tab=saved')}>
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <JobListSkeleton count={3} />;
  }

  if (!data || data.items.length === 0) {
    return <JobEmptyState type="saved" onExplore={onExploreJobs} />;
  }

  const handleSavedChange = (jobId: string, isSaved: boolean) => {
    if (!isSaved) {
      // Remove job from list immediately
      setData((prev) => {
        if (!prev) return prev;
        const newItems = prev.items.filter((j) => j.id !== jobId);
        return {
          ...prev,
          items: newItems,
          total: Math.max(0, prev.total - 1),
        };
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs sm:text-sm font-semibold text-slate-600">
          Showing {data.total} saved opportunity{data.total === 1 ? '' : 'ies'}
        </span>
      </div>

      <div className="space-y-3.5">
        {data.items.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSavedChange={handleSavedChange}
          />
        ))}
      </div>

      {data.totalPages > 1 && (
        <JobPagination
          page={page}
          totalPages={data.totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};
