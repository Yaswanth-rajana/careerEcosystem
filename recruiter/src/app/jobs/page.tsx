'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  Copy,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Users,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { RecruiterJobListDTO } from '@backend/types/recruiter';

const STATUS_TABS = ['All', 'PUBLISHED', 'DRAFT', 'PAUSED', 'CLOSED'];

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJobListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [statusTab]);

  async function fetchJobs() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusTab !== 'All') params.set('status', statusTab);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/recruiter/jobs?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load jobs');
      }
      setJobs(json.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchJobs();
  }

  async function handleDuplicate(jobId: string) {
    if (!confirm('Create a duplicate draft of this job posting?')) return;
    setActionLoadingId(jobId);
    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}/duplicate`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to duplicate job');
      }
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleStatusChange(jobId: string, newStatus: string) {
    setActionLoadingId(jobId);
    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update job status');
      }
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <RecruiterShell
      title="Job Postings"
      subtitle="Manage your company's open requisitions and recruitment pipelines"
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  statusTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab === 'All' ? 'All Postings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Create Job Posting
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, location, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Search
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Jobs List / Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading jobs...</div>
          ) : !jobs.length ? (
            <div className="p-8">
              <EmptyState
                title="No jobs found"
                description={
                  statusTab !== 'All'
                    ? `No job postings currently marked as ${statusTab.toLowerCase()}.`
                    : 'Start attracting top candidates by posting your first role.'
                }
                actionText="Create Job"
                actionHref="/jobs/new"
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition"
                      >
                        {job.title}
                      </Link>
                      <StatusBadge status={job.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.workMode}</span>
                      <span>•</span>
                      <span>{job.employmentType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{job.experienceLevel}</span>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Funnel Metrics */}
                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 text-center">
                    <div>
                      <p className="text-base font-bold text-slate-900">{job.applicationsCount}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Applied</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-emerald-600">{job.shortlistedCount}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Shortlist</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-purple-600">{job.interviewsCount}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Interviews</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Link
                      href={`/applications?jobId=${job.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      title="View Applications for this Job"
                    >
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>Pipeline</span>
                    </Link>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      title="Edit Job Posting"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={actionLoadingId === job.id}
                      onClick={() => handleDuplicate(job.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      title="Duplicate as Draft"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    {job.status === 'PUBLISHED' ? (
                      <button
                        type="button"
                        disabled={actionLoadingId === job.id}
                        onClick={() => handleStatusChange(job.id, 'PAUSED')}
                        className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 transition"
                        title="Pause Job"
                      >
                        <PauseCircle className="h-4 w-4" />
                      </button>
                    ) : job.status === 'PAUSED' || job.status === 'DRAFT' ? (
                      <button
                        type="button"
                        disabled={actionLoadingId === job.id}
                        onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                        title="Publish Job"
                      >
                        <PlayCircle className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RecruiterShell>
  );
}
