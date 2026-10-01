'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  CheckCircle2,
  XCircle,
  User,
  Plus,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { EmptyState } from '@/components/EmptyState';
import { RecruiterInterviewDTO } from '@backend/types/recruiter';

const TABS = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Today', value: 'today' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: 'all' },
];

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<RecruiterInterviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'today' | 'completed' | 'all'>('upcoming');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, [tab]);

  async function fetchInterviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/recruiter/interviews?filter=${tab}`);
      const json = await res.json();
      if (json.success) {
        setInterviews(json.data || []);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/recruiter/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update interview');
      fetchInterviews();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <RecruiterShell
      title="Interviews Schedule"
      subtitle="Coordinate and evaluate live interview sessions with candidates"
    >
      <div className="space-y-6">
        {/* Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value as any)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  tab === t.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Link
            href="/applications?status=SHORTLISTED"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Schedule New Call
          </Link>
        </div>

        {/* Interviews List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading interviews...</div>
          ) : !interviews.length ? (
            <div className="p-8">
              <EmptyState
                title="No interviews found"
                description={`No ${tab} interviews currently scheduled.`}
                actionText="View Shortlisted Candidates"
                actionHref="/applications?status=SHORTLISTED"
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {interviews.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{inv.candidateName}</span>
                      <span className="rounded bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                        {inv.type}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          inv.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Applied for: <span className="font-medium text-slate-800">{inv.jobTitle}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(inv.scheduledAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {inv.durationMinutes} mins
                      </span>
                      {inv.interviewerName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {inv.interviewerName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {inv.meetingUrl && (
                      <a
                        href={inv.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join Call
                      </a>
                    )}

                    {inv.status === 'SCHEDULED' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === inv.id}
                          onClick={() => handleStatusChange(inv.id, 'COMPLETED')}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === inv.id}
                          onClick={() => handleStatusChange(inv.id, 'CANCELLED')}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Cancel Interview"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
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
