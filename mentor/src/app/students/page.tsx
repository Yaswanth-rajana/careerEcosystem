'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MentorShell } from '@/components/MentorShell';
import { CardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Search, ChevronRight, Calendar, ArrowRight, UserCheck } from 'lucide-react';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  headline?: string | null;
  candidateType?: string | null;
  totalSessions: number;
  lastSessionDate?: string | null;
  status: 'ACTIVE' | 'COMPLETED';
}

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.set('search', search.trim());
      const res = await fetch(`/api/mentor/students?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to load mentees');
      const data = await res.json();
      setStudents(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Error fetching students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <MentorShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              My Students & Mentees
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review candidates you have mentored, track goals, and access past session notes
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students yet"
            description="Students you mentor will appear here after your first completed or scheduled booking."
            actionText="Review Your Services"
            actionHref="/mentorship/services"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const lastDate = student.lastSessionDate
                ? new Date(student.lastSessionDate).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'None';

              return (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {student.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate max-w-[170px]">
                            {student.headline || student.candidateType || 'Candidate'}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={student.status} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs my-2">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Total Sessions
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {student.totalSessions}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                          Last Session
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {lastDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                    <span>View Mentee Context</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MentorShell>
  );
}
