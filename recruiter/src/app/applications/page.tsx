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

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'All';
  const initialStatus = searchParams.get('status') || 'All';

  const [applications, setApplications] = useState<RecruiterApplicationListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <RecruiterShell
      title="Candidate Pipeline"
      subtitle="Track, evaluate, and transition candidate applications across stages"
    >
      <div className="space-y-6">
        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
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
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Job Postings</option>
              {jobsList.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Applications List */}
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
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
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
                        <Link
                          href={`/applications/${app.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Evaluate <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
