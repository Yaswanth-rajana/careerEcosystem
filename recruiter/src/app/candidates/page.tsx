'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { EmptyState } from '@/components/EmptyState';

export default function CandidatesDiscoveryPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (skill.trim()) params.set('skill', skill.trim());
      if (location.trim()) params.set('location', location.trim());

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
      title="Talent Discovery Pool"
      subtitle="Discover, search, and connect with motivated candidates active across PATHWAY.ECO"
    >
      <div className="space-y-6">
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
          <div className="p-12 text-center text-slate-400 text-xs">Searching candidate pool...</div>
        ) : !candidates.length ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <EmptyState
              title="No candidates matched your search"
              description="Try adjusting your query, skill criteria, or location filter."
              actionText="Reset Search"
              actionHref="/candidates"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex-shrink-0">
                      {cand.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
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

                  {cand.bio && (
                    <p className="text-xs text-slate-500 line-clamp-2">{cand.bio}</p>
                  )}

                  {/* Skills badges */}
                  {cand.skills && cand.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cand.skills.slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {s}
                        </span>
                      ))}
                      {cand.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{cand.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Profile Active
                  </span>
                  <button
                    type="button"
                    onClick={() => alert(`Contact request initiated for ${cand.name}.`)}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                  >
                    <Mail className="h-3 w-3" /> Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
