'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JobDetailDTO } from '@backend/types/jobs';
import { JobsApiClient } from '@/services/jobsClient';
import { useAuth } from '@/lib/AuthContext';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  Check,
  DollarSign,
  Calendar,
  Sparkles,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!jobId) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await JobsApiClient.getJobById(jobId);
        setJob(data);
        setIsSaved(data.isSaved);
      } catch (err: any) {
        console.error('Failed to load job details:', err);
        setError(err.message || 'Job opportunity not found or no longer active.');
      } finally {
        setIsLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  const handleToggleSave = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${jobId}`);
      return;
    }
    if (!job) return;

    try {
      setIsSaving(true);
      const nextSaved = !isSaved;
      setIsSaved(nextSaved);
      const finalState = await JobsApiClient.toggleSaveJob(job.id, isSaved);
      setIsSaved(finalState);
    } catch (err) {
      setIsSaved(isSaved);
      console.error('Failed to save job:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${jobId}`);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatPostedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-between">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded-md" />
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 space-y-4">
            <div className="h-8 bg-slate-200 rounded-md w-2/3" />
            <div className="h-5 bg-slate-100 rounded-md w-1/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-7 w-20 bg-slate-100 rounded-full" />
              <div className="h-7 w-24 bg-slate-100 rounded-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-between">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Opportunity Unavailable</h2>
            <p className="text-sm text-slate-500 mb-6">
              {error || 'This job posting may have been closed or is no longer accepting applications.'}
            </p>
            <Link href="/jobs">
              <Button variant="primary" size="md">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC] text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied Link!' : 'Share Opportunity'}</span>
          </button>
        </div>

        {/* Top Header Card */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-full h-full object-contain rounded-2xl p-1"
                  />
                ) : (
                  <Building2 className="w-7 h-7 text-slate-500" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                    {job.title}
                  </h1>
                  {job.jobVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Opportunity
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1 flex-wrap">
                  <span className="font-bold text-slate-800">{job.company}</span>
                  {job.companyVerified && (
                    <span title="Verified Company" className="inline-flex items-center -ml-1">
                      <Check className="w-4 h-4 text-blue-600" />
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-500">{job.workMode}</span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mt-3.5">
                  <Badge variant="neutral" size="sm" className="bg-slate-100 text-slate-700 font-medium">
                    {job.employmentType}
                  </Badge>
                  <Badge variant="neutral" size="sm" className="bg-slate-100 text-slate-700 font-medium">
                    {job.experienceLevel}
                  </Badge>
                  {job.salary && (
                    <Badge variant="brand" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                      {job.salary.formatted}
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400 pl-1">
                    Posted on {formatPostedDate(job.postedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Quick Header CTAs */}
            <div className="hidden sm:flex items-center gap-3 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={isSaving}
                className={cn(
                  'p-2.5 rounded-xl border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600',
                  isSaved
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
                aria-label={isSaved ? 'Unsave' : 'Save'}
              >
                <Bookmark className={cn('w-5 h-5', isSaved ? 'fill-blue-600 text-blue-600' : '')} />
              </button>

              {job.hasApplied ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Application Submitted
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleApplyClick}
                  className="px-6 py-2.5 font-bold shadow-xs bg-blue-600 hover:bg-blue-700"
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Role Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About the Role */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">
                About the Opportunity
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">
                  Requirements & Qualifications
                </h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">
                  Target Skills
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nice to Have */}
            {job.niceToHave && job.niceToHave.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">
                  Nice to Have
                </h2>
                <ul className="space-y-2.5">
                  {job.niceToHave.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits & Perks */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4 font-display">
                  Benefits & Perks
                </h2>
                <ul className="space-y-2.5">
                  {job.benefits.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Sticky Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs sticky top-24 space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-4">Job Overview</h3>
                <dl className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <dt className="text-slate-500">Company</dt>
                    <dd className="font-semibold text-slate-900 text-right">{job.company}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <dt className="text-slate-500">Location</dt>
                    <dd className="font-semibold text-slate-900 text-right">{job.location}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <dt className="text-slate-500">Work Mode</dt>
                    <dd className="font-semibold text-slate-900 text-right">{job.workMode}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <dt className="text-slate-500">Employment Type</dt>
                    <dd className="font-semibold text-slate-900 text-right">{job.employmentType}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <dt className="text-slate-500">Experience</dt>
                    <dd className="font-semibold text-slate-900 text-right">{job.experienceLevel}</dd>
                  </div>
                  {job.salary && (
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <dt className="text-slate-500">Salary</dt>
                      <dd className="font-bold text-emerald-700 text-right">{job.salary.formatted}</dd>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-slate-500">Posted</dt>
                    <dd className="font-semibold text-slate-900 text-right">
                      {formatPostedDate(job.postedAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Action Buttons in Sticky Sidebar */}
              <div className="space-y-2.5 pt-2">
                {job.hasApplied ? (
                  <div className="w-full text-center py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Application Submitted
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleApplyClick}
                    className="w-full font-bold shadow-xs bg-blue-600 hover:bg-blue-700"
                  >
                    Apply for this Role
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="md"
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  leftIcon={
                    <Bookmark
                      className={cn('w-4 h-4', isSaved ? 'fill-blue-600 text-blue-600' : '')}
                    />
                  }
                  className="w-full text-xs font-semibold"
                >
                  {isSaved ? 'Saved to Your List' : 'Save for Later'}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 shadow-lg z-40 flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className="p-3 rounded-xl border border-slate-200 text-slate-600 shrink-0"
        >
          <Bookmark className={cn('w-5 h-5', isSaved ? 'fill-blue-600 text-blue-600' : '')} />
        </button>

        {job.hasApplied ? (
          <div className="flex-1 text-center py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
            Applied ✓
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleApplyClick}
            className="flex-1 font-bold bg-blue-600"
          >
            Apply Now
          </Button>
        )}
      </div>

      {/* Deliberate Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setJob((prev) => (prev ? { ...prev, hasApplied: true, applicationStatus: 'APPLIED' } : null));
        }}
      />

      <Footer />
    </div>
  );
}
