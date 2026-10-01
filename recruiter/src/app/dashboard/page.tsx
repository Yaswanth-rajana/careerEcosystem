'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Calendar,
  Award,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { useRecruiterAuth } from '@/lib/recruiterAuthContext';
import { RecruiterDashboardDTO } from '@backend/types/recruiter';

export default function RecruiterDashboardPage() {
  const { recruiterData } = useRecruiterAuth();
  const [data, setData] = useState<RecruiterDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recruiter/dashboard');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load dashboard');
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const company = recruiterData?.company;
  const user = recruiterData?.user;

  return (
    <RecruiterShell
      title={`Welcome back, ${user?.name || 'Recruiter'}`}
      subtitle={`Hiring overview for ${company?.name || 'your company'}`}
    >
      <div className="space-y-8">
        {/* Verification banner if pending */}
        {company && !company.verified && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Company Verification Pending</p>
              <p className="text-amber-700 mt-0.5">
                Our trust & safety team is verifying your company credentials. You can draft job postings and set up your team in the meantime.
              </p>
            </div>
          </div>
        )}

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recruiter Actions</h2>
            <p className="text-xs text-slate-500">Fast shortcuts to manage your hiring funnel</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </Link>
            <Link
              href="/candidates"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Users className="h-4 w-4 text-slate-500" />
              Find Candidates
            </Link>
            <Link
              href="/interviews"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Calendar className="h-4 w-4 text-slate-500" />
              Schedule Interview
            </Link>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchDashboard}
              className="font-medium underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Jobs</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '-' : data?.summary.activeJobs || 0}
            </p>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <Link href="/jobs" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                View all jobs <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">To Review</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '-' : data?.summary.candidatesToReview || 0}
            </p>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <Link href="/applications?status=APPLIED" className="text-amber-600 hover:underline inline-flex items-center gap-1">
                Review pending <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Shortlisted</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '-' : data?.summary.shortlisted || 0}
            </p>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <Link href="/applications?status=SHORTLISTED" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
                View shortlist <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Upcoming Interviews</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '-' : data?.summary.upcomingInterviews || 0}
            </p>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <Link href="/interviews" className="text-purple-600 hover:underline inline-flex items-center gap-1">
                Interview calendar <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Recent Applications & Upcoming Interviews */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Applications requiring action */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Applications</h3>
                <p className="text-xs text-slate-500">Candidate profiles awaiting recruiter action</p>
              </div>
              <Link
                href="/applications"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-4 flex-1">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : !data?.actionRequired.recentApplications.length ? (
                <EmptyState
                  title="No new applications"
                  description="When candidates apply to your posted jobs, they will appear here for review."
                  actionText="Explore Candidates"
                  actionHref="/candidates"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.actionRequired.recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/applications/${app.id}`}
                          className="text-sm font-medium text-slate-900 hover:text-blue-600 truncate block"
                        >
                          {app.candidateName}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">{app.jobTitle}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={app.status} />
                        <Link
                          href={`/applications/${app.id}`}
                          className="rounded p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Upcoming Interviews</h3>
                <p className="text-xs text-slate-500">Scheduled candidate evaluation calls</p>
              </div>
              <Link
                href="/interviews"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Calendar <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-4 flex-1">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : !data?.actionRequired.upcomingInterviews.length ? (
                <EmptyState
                  title="No interviews scheduled"
                  description="Move candidates to the Interview stage and schedule discussions here."
                  actionText="View Shortlisted"
                  actionHref="/applications?status=SHORTLISTED"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.actionRequired.upcomingInterviews.map((inv) => (
                    <div
                      key={inv.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {inv.candidateName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{inv.jobTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {inv.type}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(inv.scheduledAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      {inv.meetingUrl && (
                        <a
                          href={inv.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition flex-shrink-0"
                        >
                          Join <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Jobs Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Your Recent Job Postings</h3>
              <p className="text-xs text-slate-500">Overview of recent openings and candidate volume</p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Role Title</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Applications</th>
                  <th className="py-3 px-5">Work Mode</th>
                  <th className="py-3 px-5">Created</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading job postings...
                    </td>
                  </tr>
                ) : !data?.recentJobs.length ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No jobs created yet. Click &quot;Post New Job&quot; above to publish your first role.
                    </td>
                  </tr>
                ) : (
                  data.recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
                          {job.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3.5 px-5 font-medium">{job.applicationsCount}</td>
                      <td className="py-3.5 px-5 text-slate-600 capitalize">{job.workMode.toLowerCase()}</td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RecruiterShell>
  );
}
