import React, { useState, useEffect } from 'react';
import { ApplicationDTO, PaginatedResult } from '@backend/types/jobs';
import { JobsApiClient } from '@/services/jobsClient';
import { ApplicationCard } from './ApplicationCard';
import { JobEmptyState } from './JobEmptyState';
import { JobListSkeleton } from './JobListSkeleton';
import { JobPagination } from './JobPagination';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/design-system/Button';

interface Props {
  onExploreJobs?: () => void;
}

export const ApplicationsView: React.FC<Props> = ({ onExploreJobs }) => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<PaginatedResult<ApplicationDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchApplications = async (targetPage: number) => {
    try {
      setIsLoading(true);
      const res = await JobsApiClient.getApplications(targetPage, 20);
      setData(res);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        fetchApplications(page);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading, page]);

  if (!isAuthLoading && !user) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Sign in to track applications</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
          Access your submission history, interview updates, and feedback across all your applied roles.
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/login?redirect=/jobs?tab=applications')}>
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <JobListSkeleton count={3} />;
  }

  if (!data || data.items.length === 0) {
    return <JobEmptyState type="applications" onExplore={onExploreJobs} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs sm:text-sm font-semibold text-slate-600">
          Showing {data.total} application{data.total === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-3.5">
        {data.items.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onWithdrawn={() => fetchApplications(page)}
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
