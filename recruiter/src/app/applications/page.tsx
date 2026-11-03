'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileCheck2,
  Search,
  Filter,
  Users,
  FileText,
  ChevronRight,
  ExternalLink,
  Award,
  LayoutGrid,
  List,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { RecruiterApplicationListDTO } from '@backend/types/recruiter';

const STAGE_TABS = [
  { label: 'All', value: 'All' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Offer', value: 'OFFER' },
  { label: 'Rejected', value: 'REJECTED' },
];

const PIPELINE_COLUMNS = [
  { id: 'APPLIED', title: 'Applied', color: 'border-blue-400 bg-blue-50/30' },
  { id: 'UNDER_REVIEW', title: 'Under Review', color: 'border-amber-400 bg-amber-50/30' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'border-indigo-400 bg-indigo-50/30' },
  { id: 'INTERVIEW', title: 'Interview', color: 'border-purple-400 bg-purple-50/30' },
  { id: 'OFFER', title: 'Offer', color: 'border-emerald-400 bg-emerald-50/30' },
  { id: 'REJECTED', title: 'Archived / Rejected', color: 'border-slate-300 bg-slate-50/30' },
];

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'All';
  const initialStatus = searchParams.get('status') || 'All';

  const [applications, setApplications] = useState<RecruiterApplicationListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('table');

  const [stageFilter, setStageFilter] = useState(initialStatus);
  const [jobFilter, setJobFilter] = useState(initialJobId);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobsList, setJobsList] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    fetchJobsDropdown();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [stageFilter, jobFilter]);

  async function fetchJobsDropdown() {
    try {
      const res = await fetch('/api/recruiter/jobs?limit=100');
      const json = await res.json();
      if (json.success && json.items) {
        setJobsList(json.items.map((j: any) => ({ id: j.id, title: j.title })));
      }
    } catch (_) {}
  }

  async function fetchApplications() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (stageFilter !== 'All') params.set('status', stageFilter);
      if (jobFilter !== 'All') params.set('jobId', jobFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/recruiter/applications?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load applications');
      }
      setApplications(json.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchApplications();
  }

  async function handleQuickTransition(applicationId: string, newStatus: string) {
    setActionLoadingId(applicationId);
    try {
      const res = await fetch(`/api/recruiter/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update status');
      }
      // Re-fetch to guarantee sync with job counters
      fetchApplications();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <RecruiterShell
      title="Candidate Pipeline"
      subtitle="Track, evaluate, and transition candidate applications across stages"
    >
      <div className="space-y-6">
        {/* Header Action Bar: Stage Tabs + View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STAGE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStageFilter(tab.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  stageFilter === tab.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'board'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline Board
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Job Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer hover:border-slate-300 transition"
              >
                <option value="All">All Job Postings</option>
                {jobsList.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* View Mode: Kanban Pipeline Board */}
        {viewMode === 'board' ? (
          loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading recruitment pipeline...</div>
          ) : !applications.length ? (
            <div className="p-8 bg-white border border-slate-200 rounded-xl">
              <EmptyState
                title="No candidates in pipeline"
                description="Applications will appear here once candidates apply to your posted jobs."
                actionText="Explore Talent Pool"
                actionHref="/candidates"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {PIPELINE_COLUMNS.map((col) => {
                const columnApps = applications.filter((app) => app.status === col.id);
                return (
                  <div
                    key={col.id}
                    className={`rounded-2xl border ${col.color} p-3 flex flex-col min-h-[420px]`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                      <span className="font-bold text-xs text-slate-900">{col.title}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200 shadow-2xs">
                        {columnApps.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {!columnApps.length ? (
                        <div className="p-4 text-center text-slate-400 text-[11px] italic">
                          No candidates
                        </div>
                      ) : (
                        columnApps.map((app) => (
                          <div
                            key={app.id}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs hover:shadow-md hover:border-blue-300 transition space-y-2.5"
                          >
                            <div>
                              <Link
                                href={`/applications/${app.id}`}
                                className="font-bold text-xs text-slate-900 hover:text-blue-600 block line-clamp-1"
                              >
                                {app.candidateName}
                              </Link>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{app.jobTitle}</p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                              <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                              {app.hasResume ? (
                                <a
                                  href={`/api/recruiter/applications/${app.id}/resume`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                                >
                                  <FileText className="w-3 h-3" /> Resume
                                </a>
                              ) : null}
                            </div>

                            {/* Quick Pipeline Actions */}
                            <div className="flex items-center gap-1.5 pt-1.5">
                              {app.status === 'APPLIED' || app.status === 'UNDER_REVIEW' ? (
                                <button
                                  type="button"
                                  disabled={actionLoadingId === app.id}
                                  onClick={() => handleQuickTransition(app.id, 'SHORTLISTED')}
                                  className="flex-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
                                >
                                  Shortlist
                                </button>
                              ) : app.status === 'SHORTLISTED' ? (
                                <button
                                  type="button"
                                  disabled={actionLoadingId === app.id}
                                  onClick={() => handleQuickTransition(app.id, 'INTERVIEW')}
                                  className="flex-1 rounded-lg bg-purple-50 border border-purple-200 px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 transition"
                                >
                                  Interview
                                </button>
                              ) : null}

                              <Link
                                href={`/applications/${app.id}`}
                                className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 transition"
                                title="View candidate profile and full evaluation"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* View Mode: Table List */
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading applications...</div>
            ) : !applications.length ? (
              <div className="p-8">
                <EmptyState
                  title="No applications found"
                  description={
                    stageFilter !== 'All'
                      ? `No candidates in the "${stageFilter.replace('_', ' ')}" stage for this filter.`
                      : 'Applications will appear here once candidates apply to your posted jobs.'
                  }
                  actionText="Explore Marketplace Candidates"
                  actionHref="/candidates"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Candidate</th>
                      <th className="py-3.5 px-5">Applied Role</th>
                      <th className="py-3.5 px-5">Stage</th>
                      <th className="py-3.5 px-5">Assessment Score</th>
                      <th className="py-3.5 px-5">Resume</th>
                      <th className="py-3.5 px-5">Applied Date</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-5">
                          <Link
                            href={`/applications/${app.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 block"
                          >
                            {app.candidateName}
                          </Link>
                          <p className="text-[11px] text-slate-400">{app.candidateEmail}</p>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-800">
                          <Link href={`/jobs/${app.jobId}`} className="hover:underline">
                            {app.jobTitle}
                          </Link>
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-3.5 px-5">
                          {app.latestScore !== null ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              <Award className="h-3 w-3" />
                              {app.latestScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {app.hasResume ? (
                            <a
                              href={`/api/recruiter/applications/${app.id}/resume`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Not attached</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {app.status === 'APPLIED' && (
                              <button
                                type="button"
                                disabled={actionLoadingId === app.id}
                                onClick={() => handleQuickTransition(app.id, 'SHORTLISTED')}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 hover:bg-indigo-100"
                              >
                                Shortlist
                              </button>
                            )}
                            <Link
                              href={`/applications/${app.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Evaluate <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading applications...</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
