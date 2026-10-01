import React from 'react';
import { JobCardDTO } from '@backend/types/jobs';
import { JobCard } from './JobCard';
import { Sparkles, Compass } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/design-system/Button';

interface Props {
  jobs: JobCardDTO[];
  isLoading?: boolean;
  onSavedChange?: (jobId: string, isSaved: boolean) => void;
  className?: string;
}

export const RecommendedJobs: React.FC<Props> = ({
  jobs,
  isLoading,
  onSavedChange,
  className,
}) => {
  if (!isLoading && jobs.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Set up your Career Profile to unlock tailored recommendations
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
          Tell us your target role and skills to receive curated opportunities matched directly to your direction.
        </p>
        <Link href="/onboarding">
          <Button variant="primary" size="sm">
            Complete Career Profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <section className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">For You</h2>
            <p className="text-xs text-slate-500">
              Curated opportunities aligned with your career goals and verified skills.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSavedChange={onSavedChange}
            isCompact={false}
            className="h-full border-blue-100 bg-gradient-to-b from-blue-50/20 to-white"
          />
        ))}
      </div>
    </section>
  );
};
