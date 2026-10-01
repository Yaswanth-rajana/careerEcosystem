import React, { useState } from 'react';
import Link from 'next/link';
import { JobCardDTO } from '@backend/types/jobs';
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Building2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { JobsApiClient } from '@/services/jobsClient';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: JobCardDTO;
  onSavedChange?: (jobId: string, isSaved: boolean) => void;
  className?: string;
  isCompact?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSavedChange,
  className,
  isCompact = false,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(job.isSaved);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?redirect=/jobs`);
      return;
    }

    try {
      setIsSaving(true);
      const nextSavedState = !isSaved;
      setIsSaved(nextSavedState); // optimistic update

      const finalSavedState = await JobsApiClient.toggleSaveJob(job.id, isSaved);
      setIsSaved(finalSavedState);
      if (onSavedChange) {
        onSavedChange(job.id, finalSavedState);
      }
    } catch (err) {
      // Revert on failure
      setIsSaved(isSaved);
      console.error('Failed to toggle save job:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPostedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className={cn(
        'group relative bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md hover:border-slate-300 flex flex-col justify-between',
        job.featured ? 'ring-1 ring-blue-500/20 bg-gradient-to-b from-blue-50/20 to-white' : '',
        className
      )}
    >
      <div>
        {/* Match Reason Banner if provided */}
        {job.matchReason && (
          <div className="mb-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 border border-blue-200/70 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{job.matchReason}</span>
          </div>
        )}

        {/* Top Header: Title, Company, Save Action */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Company Avatar / Logo Placeholder */}
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-colors">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-contain rounded-xl p-1"
                />
              ) : (
                <Building2 className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/jobs/${job.id}`}
                  className="font-bold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {job.title}
                </Link>
                {job.jobVerified && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80"
                    title="Verified Opportunity"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mt-0.5 flex-wrap">
                <span className="font-semibold text-slate-800">{job.company}</span>
                {job.companyVerified && (
                  <span title="Verified Company" className="inline-flex items-center -ml-1">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{job.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bookmark / Save Button */}
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={isSaving}
            aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
            className={cn(
              'p-2 rounded-xl border transition-all duration-200 shrink-0 focus-visible:ring-2 focus-visible:ring-blue-600',
              isSaved
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100/70'
                : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <Bookmark className={cn('w-4 h-4', isSaved ? 'fill-blue-600 text-blue-600' : '')} />
          </button>
        </div>

        {/* Badges: Work Mode, Employment Type, Experience Level */}
        <div className="flex items-center gap-2 flex-wrap mt-3.5">
          <Badge variant="neutral" size="sm" className="font-medium bg-slate-100 text-slate-700">
            {job.workMode}
          </Badge>
          <Badge variant="neutral" size="sm" className="font-medium bg-slate-100 text-slate-700">
            {job.employmentType}
          </Badge>
          <Badge variant="neutral" size="sm" className="font-medium bg-slate-100 text-slate-700">
            {job.experienceLevel}
          </Badge>
          {job.salary && (
            <Badge variant="brand" size="sm" className="font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
              {job.salary.formatted}
            </Badge>
          )}
        </div>

        {/* Skills Tag Row */}
        {!isCompact && job.skills && job.skills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100">
            {job.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-[11px] font-medium text-slate-400 pl-0.5">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Posted Date & Action */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Posted {formatPostedDate(job.postedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {job.hasApplied ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Applied
            </span>
          ) : null}

          <Link href={`/jobs/${job.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold hover:border-blue-600 hover:text-blue-600 py-1.5 px-3"
            >
              View Job
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
