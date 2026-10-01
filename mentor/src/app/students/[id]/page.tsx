'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MentorShell } from '@/components/MentorShell';
import { CardSkeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { MentorStudentDTO } from '@backend/types/mentorship';
import {
  ArrowLeft,
  User,
  Target,
  Briefcase,
  History,
  CheckSquare,
  FileText,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<MentorStudentDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/mentor/students/${params.id}`);
        if (!res.ok) throw new Error('Failed to load student context');
        const data = await res.json();
        setStudent(data.student);
      } catch (err: any) {
        setError(err.message || 'Error fetching student detail');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  return (
    <MentorShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/students"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Mentee Profile & History
            </h1>
            <p className="text-xs text-slate-500">Authorized Mentorship Context</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <CardSkeleton />
        ) : student ? (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center border border-blue-200">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {student.name}
                  </h2>
                  <p className="text-xs text-slate-500">{student.email}</p>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    {student.headline || student.candidateType || 'Candidate'}
                    {student.location && ` • ${student.location}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-center px-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Total Sessions
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {student.mentorshipStats.totalSessions}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Completed
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    {student.mentorshipStats.completedSessions}
                  </span>
                </div>
              </div>
            </div>

            {/* Career Goals & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Career Goal */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Target className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Career Aspirations
                  </h3>
                </div>

                {student.careerGoal ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Target Role
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {student.careerGoal.targetRole}
                      </span>
                    </div>

                    {student.careerGoal.careerField && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Field / Specialization
                        </span>
                        <span className="text-slate-700">{student.careerGoal.careerField}</span>
                      </div>
                    )}

                    {student.careerGoal.timeframe && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Target Timeline
                        </span>
                        <span className="text-slate-700">{student.careerGoal.timeframe}</span>
                      </div>
                    )}

                    {student.careerGoal.notes && (
                      <div className="pt-2 text-slate-600 italic">
                        &ldquo;{student.careerGoal.notes}&rdquo;
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No career goal recorded.</p>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Skills & Competencies
                  </h3>
                </div>

                {student.skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {student.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                      >
                        {s.name}{' '}
                        <span className="text-[10px] text-slate-400">({s.level.toLowerCase()})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mentorship History Timeline (Requirement 21) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <History className="w-4 h-4 text-slate-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Mentorship Journey & Historical Sessions
                </h3>
              </div>

              <div className="space-y-4">
                {student.history.map((item, idx) => {
                  const date = new Date(item.scheduledStart);
                  const formattedDate = date.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={item.bookingId}
                      className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {item.serviceTitle}
                            </span>
                            <StatusBadge status={item.status} size="sm" />
                          </div>
                          <span className="text-xs text-slate-500">{formattedDate}</span>
                        </div>

                        {item.sessionId && (
                          <Link
                            href={`/mentorship/sessions/${item.sessionId}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            Open Session <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {item.notes && (
                        <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs text-slate-700">
                          <span className="font-semibold text-slate-800 block mb-1">
                            Discussion Notes:
                          </span>
                          <p className="whitespace-pre-line leading-relaxed">{item.notes}</p>
                        </div>
                      )}

                      {item.actionItems && item.actionItems.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Assigned Action Items
                          </span>
                          <div className="space-y-1">
                            {item.actionItems.map((act) => (
                              <div
                                key={act.id}
                                className="flex items-center gap-2 text-xs text-slate-700"
                              >
                                <CheckSquare
                                  className={`w-3.5 h-3.5 ${
                                    act.completed ? 'text-emerald-600' : 'text-slate-400'
                                  }`}
                                />
                                <span className={act.completed ? 'line-through text-slate-400' : ''}>
                                  {act.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MentorShell>
  );
}
