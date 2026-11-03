'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Mail,
  CheckCircle2,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';

export default function CandidatesDiscoveryPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<'applicants' | 'all'>('applicants');
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, [filterType]);

  async function fetchCandidates() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (skill.trim()) params.set('skill', skill.trim());
      if (location.trim()) params.set('location', location.trim());
      if (filterType === 'applicants') params.set('onlyApplicants', 'true');

      const res = await fetch(`/api/recruiter/candidates?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to search candidates');
      }
      setCandidates(json.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCandidates();
  }

  return (
    <RecruiterShell
      title="Candidates & Talent Pool"
      subtitle="Discover and review applicants to your company's jobs and talent community"
    >
      <div className="space-y-6">
        {/* Filter Type Toggle */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setFilterType('applicants')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              filterType === 'applicants'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Direct Applicants
          </button>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Talent Pool
          </button>
        </div>

        {/* Search and Filters */}
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, headline, or current role..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by skill (e.g. React)..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Candidate Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading candidates...</div>
        ) : !candidates.length ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <EmptyState
              title={
                filterType === 'applicants'
                  ? 'No applicants yet'
                  : 'No candidates matched your search'
              }
              description={
                filterType === 'applicants'
                  ? 'Candidates who apply to your job postings will be displayed here with their applied role and pipeline stage.'
                  : 'Try adjusting your search criteria, skill filter, or location.'
              }
              actionText={filterType === 'applicants' ? 'View Job Postings' : 'Reset Search'}
              actionHref={filterType === 'applicants' ? '/jobs' : '/candidates'}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((cand) => {
              const skillsList = cand.skills || cand.topSkills || [];
              return (
                <div
                  key={cand.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex-shrink-0">
                        {cand.name ? cand.name.slice(0, 2).toUpperCase() : 'CD'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{cand.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {cand.headline || cand.currentRole || 'Candidate'}
                        </p>
                        {cand.location && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {cand.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Applied Job Info Badge */}
                    {cand.appliedJobTitle && (
                      <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">Applied Role:</span>
                          <StatusBadge status={cand.applicationStatus} />
                        </div>
                        <p className="text-xs font-bold text-blue-900 line-clamp-1">
                          {cand.appliedJobTitle}
                        </p>
                        {cand.appliedAt && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Applied on{' '}
                            {new Date(cand.appliedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {cand.bio && (
                      <p className="text-xs text-slate-500 line-clamp-2">{cand.bio}</p>
                    )}

                    {/* Skills badges */}
                    {skillsList.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {skillsList.slice(0, 4).map((s: string) => (
                          <span
                            key={s}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                        {skillsList.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{skillsList.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {cand.applicationId ? (
                      <Link
                        href={`/applications/${cand.applicationId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        View Application <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Profile Active
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => alert(`Contact request initiated for ${cand.name}.`)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Mail className="h-3 w-3" /> Connect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
