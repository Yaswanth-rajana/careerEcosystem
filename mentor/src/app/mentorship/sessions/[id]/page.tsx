'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MentorShell } from '@/components/MentorShell';
import { CardSkeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { ActionItemDTO } from '@backend/types/mentorship';
import { SessionDetailViewDTO } from '@backend/services/mentorship/sessionService';
import {
  Video,
  ArrowLeft,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  FileText,
  User,
  History,
} from 'lucide-react';

export default function SessionWorkspacePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<SessionDetailViewDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable session state
  const [notes, setNotes] = useState('');
  const [actionItems, setActionItems] = useState<ActionItemDTO[]>([]);
  const [newActionText, setNewActionText] = useState('');
  const [status, setStatus] = useState<string>('SCHEDULED');

  const fetchSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/sessions/${params.id}`);
      if (!res.ok) throw new Error('Failed to retrieve session');
      const json: SessionDetailViewDTO = await res.json();
      setData(json);
      setNotes(json.session.notes || '');
      setActionItems(json.session.actionItems || []);
      setStatus(json.session.status);
    } catch (err: any) {
      setError(err.message || 'Error loading session');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [params.id]);

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    const newItem: ActionItemDTO = {
      id: `act-${Date.now()}`,
      text: newActionText.trim(),
      completed: false,
    };

    setActionItems((prev) => [...prev, newItem]);
    setNewActionText('');
  };

  const handleToggleAction = (itemId: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleRemoveAction = (itemId: string) => {
    setActionItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/sessions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          actionItems,
          status,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to save notes');
      }

      setSuccessMsg('Session notes and action items saved successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchSession();
    } catch (err: any) {
      setError(err.message || 'Error saving session notes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MentorShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <Link
              href="/mentorship/bookings"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                  Session Workspace
                </h1>
                {data && <StatusBadge status={status} size="sm" />}
              </div>
              <p className="text-xs text-slate-500">
                Conduct mentorship, log discussion takeaways, and assign concrete action items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data?.session.meetingUrl && (
              <a
                href={data.session.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
              >
                <Video className="w-4 h-4" />
                Join Video Meeting
              </a>
            )}

            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interactive Notes & Action Items (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Goal Banner */}
              {data.booking.studentNotes && (
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5 text-blue-900 font-semibold text-xs uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    <span>Candidate Session Goal</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-950 italic leading-relaxed">
                    &ldquo;{data.booking.studentNotes}&rdquo;
                  </p>
                </div>
              )}

              {/* Session Status Selector */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Session Status</span>
                  <span className="text-[11px] text-slate-400">Update progress as you mentor</span>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Mentor Session Notes Editor */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      Mentor Discussion Notes
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Markdown supported</span>
                </div>

                <textarea
                  rows={8}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record key advice, interview evaluation, architectural suggestions, or strengths..."
                  className="w-full p-4 text-xs sm:text-sm text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition leading-relaxed font-sans"
                />
              </div>

              {/* Action Items Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      Action Items for Student
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {actionItems.filter((a) => a.completed).length}/{actionItems.length} completed
                  </span>
                </div>

                <form onSubmit={handleAddActionItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="e.g. Practice SQL window functions, complete microservices repo..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>

                {actionItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No action items added yet. Add concrete next steps for the mentee.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {actionItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                          item.completed
                            ? 'bg-slate-50/60 border-slate-100 text-slate-400 line-through'
                            : 'bg-white border-slate-200/80 text-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleAction(item.id)}
                          className="flex items-center gap-2.5 text-left flex-1"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                          <span className="font-medium">{item.text}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveAction(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Student Context & Preparation Sidebar (1 col) */}
            <div className="space-y-5">
              {/* Student Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Student Context
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center border border-blue-200">
                    {data.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{data.student.name}</h4>
                    <p className="text-xs text-slate-500">{data.student.email}</p>
                    <p className="text-xs text-slate-600 font-medium">
                      {data.student.headline || data.student.candidateType || 'Candidate'}
                    </p>
                  </div>
                </div>

                {data.student.careerGoal?.targetRole && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Target Career Role
                    </span>
                    <span className="text-xs font-bold text-slate-800 block">
                      {data.student.careerGoal.targetRole}
                    </span>
                    {data.student.careerGoal.careerField && (
                      <span className="text-[11px] text-slate-500 block">
                        Field: {data.student.careerGoal.careerField}
                      </span>
                    )}
                  </div>
                )}

                {data.student.skills && data.student.skills.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Verified Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.student.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Previous Mentorship History */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <History className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Previous Sessions
                  </h3>
                </div>

                {data.previousSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    This is your first session with this student.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.previousSessions.map((prev) => (
                      <div
                        key={prev.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {prev.serviceTitle}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(prev.scheduledStart).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <StatusBadge status={prev.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MentorShell>
  );
}
